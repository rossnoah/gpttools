import { Hono } from "hono";
import { prisma } from "..";

import { generatePowerPointFromSlideshow as generatePowerPoint } from "./generation";
import { z } from "zod";
import { getImage } from "./imageGetter";

const slideshow = new Hono();

const ImageSchema = z.object({
  url: z.string(),
  caption: z.string().optional(),
});
const SlideSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  image: ImageSchema.optional(),
});
const TitleSlideSchema = z.object({
  presentationName: z.string(),
  presentationSubtitle: z.string(),
});

const SlideshowSchema = z.object({
  titleSlide: TitleSlideSchema,
  slides: z.array(SlideSchema),
});

export interface Slideshow {
  titleSlide: TitleSlide;
  slides: Slide[];
}

export interface TitleSlide {
  presentationName: string;
  presentationSubtitle: string;
}

export interface Slide {
  title: string;
  subtitle?: string;
  bullets?: string[];
  image?: Image;
}

export interface Image {
  url: string;
  caption?: string;
}

slideshow.get("/:uuid/:theme", async (c) => {
  let { uuid, theme } = c.req.param();

  theme = theme.toLowerCase();

  // possible themes
  // earthy, corporate, classic, confidence, calm

  const data = await prisma.slideshow.findUnique({
    where: { id: uuid },
    include: { slides: { include: { image: true } } },
  });

  if (!data) {
    return c.json({ error: "Slideshow not found" }, 404);
  }

  //make a slideshow object from the data
  const slideshow: Slideshow = {
    titleSlide: {
      presentationName: data.title,
      presentationSubtitle: data.subtitle,
    },
    slides: data.slides.map((slide) => ({
      title: slide.title,
      subtitle: slide.subtitle ?? undefined,
      bullets: slide.bullets ? slide.bullets.split(",") : undefined,
      image: slide.image
        ? {
            url: slide.image.url,
            caption: slide.image.caption ?? undefined,
          }
        : undefined,
    })),
  };

  const powerPointStream = await generatePowerPoint(slideshow, theme);
  try {
    let buffer;

    // Handle ArrayBuffer, Blob, or Uint8Array directly as they can be treated as Buffer-like
    if (
      powerPointStream instanceof ArrayBuffer ||
      powerPointStream instanceof Uint8Array
    ) {
      buffer = Buffer.from(powerPointStream);
    } else if (powerPointStream instanceof Blob) {
      // Convert Blob to ArrayBuffer then to Buffer
      const arrayBuffer = await powerPointStream.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else if (typeof powerPointStream === "string") {
      // Convert string to Buffer
      buffer = Buffer.from(powerPointStream);
    } else {
      throw new Error("Unsupported type for powerPointStream");
    }

    // Set headers for the response to indicate a downloadable file
    c.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );
    c.header("Content-Disposition", `attachment; filename="${data.id}.pptx"`);

    // Respond with the buffer as the body
    return c.body(buffer);
  } catch (e) {
    return c.text("Error generating PowerPoint", 500);
  }
});

slideshow.post("/:theme", async (c) => {
  let { theme } = c.req.param();
  let body = await c.req.json();
  const result = SlideshowSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: "Invalid request body" }, 400);
  }

  const { titleSlide, slides } = result.data;

  //map the image url to the actual image url by looping over the slides and calling the getImage function
  for (let slide of slides) {
    if (typeof slide.image === "object" && slide.image.url) {
      const { url, attribution } = await getImage(slide.image.url);
      if (!attribution) {
        continue;
      }
      slide.image.url = url;
      slide.image.caption = attribution;
    }
  }

  // Transform slides and images into a format suitable for Prisma
  const transformedSlides = slides.map((slide) => ({
    title: slide.title,
    subtitle: slide.subtitle,
    bullets: slide.bullets ? slide.bullets.join(",") : null, // Storing bullets as a comma-separated string or null
    image: slide.image
      ? {
          create: {
            url: slide.image.url,
            caption: slide.image.caption,
          },
        }
      : undefined,
  }));

  // Save the slideshow and its slides to the database
  const savedSlideshow = await prisma.slideshow.create({
    data: {
      title: titleSlide.presentationName,
      subtitle: titleSlide.presentationSubtitle,
      slides: {
        create: transformedSlides.map((slide) => ({
          ...slide,
          bullets: slide.bullets || "", // Ensure bullets is always a string
        })),
      },
    },
  });

  const generateURL = (uuid: string) => {
    return `${process.env.DOMAIN}/slideshow/${uuid}/${theme}`;
  };

  const slideShowURl = generateURL(savedSlideshow.id);

  interface SlideshowResponse {
    url: string;
  }

  const response: SlideshowResponse = {
    url: slideShowURl,
  };

  return c.json(response, 201);
});

export default slideshow;
