import PptxGenJS from "pptxgenjs";
import { Slide, Slideshow } from "./slideshow";

type Theme = {
  name: string;
  titleFont: string;
  titleFontSize: number;
  titleColor: string;
  titleBold: boolean;
  subtitleFont: string;
  subtitleFontSize: number;
  subtitleColor: string;
  subtitleItalic: boolean;
  titleSlideBackgroundColor: string;
  contentSlideBackgroundColor: string;
};

const EarthyTheme = {
  name: "Earthy Serenity",
  titleFont: "Serif", // A classic font for a touch of elegance
  titleFontSize: 30,
  titleColor: "#4E342E", // Deep brown for earthy warmth and depth
  titleBold: true,
  subtitleFont: "Sans Serif", // Clean and modern for readability
  subtitleFontSize: 22,
  subtitleColor: "#795548", // Lighter brown for a softer contrast
  subtitleItalic: false,
  titleSlideBackgroundColor: "#A5D6A7", // Soft green for a fresh, calming backdrop
  contentSlideBackgroundColor: "#B0BEC5", // Light blue-gray for a tranquil, airy feel
};
const ClassicTheme: Theme = {
  name: "Classic",
  titleFont: "Georgia",
  titleFontSize: 24,
  titleColor: "333333",
  titleBold: true,
  subtitleFont: "Georgia",
  subtitleFontSize: 18,
  subtitleColor: "666666",
  subtitleItalic: true,
  titleSlideBackgroundColor: "FFF0E0",
  contentSlideBackgroundColor: "FFF5E5",
} as const;

const CorporateTheme: Theme = {
  name: "Refined Corporate",
  titleFont: "Helvetica", // A widely-used sans-serif font known for its clarity and professionalism
  titleFontSize: 32,
  titleColor: "#4D4847", // A deep charcoal for sophistication without the harshness of black
  titleBold: true,
  subtitleFont: "Calibri", // Another clear, sans-serif font that's common in professional documents
  subtitleFontSize: 24,
  subtitleColor: "#5B9BD5", // A muted blue for a touch of corporate color without being overwhelming
  subtitleItalic: false,
  titleSlideBackgroundColor: "#FFFFFF", // Pure white for a clean, crisp background that's easy on the eyes
  contentSlideBackgroundColor: "#F4F4F4", // A very light gray for the content slides to add depth while maintaining readability
};

const ConfidenceTheme: Theme = {
  name: "ConfidenceTheme",
  titleFont: "Open Sans", // A modern sans-serif font known for its readability and clean lines
  titleFontSize: 30,
  titleColor: "#005A8B", // A strong, deep blue conveying trust and stability
  titleBold: true,
  subtitleFont: "Arial", // Universally recognized and professional
  subtitleFontSize: 24,
  subtitleColor: "#D24726", // A vibrant red for a dynamic contrast, suggesting action and confidence
  subtitleItalic: false,
  titleSlideBackgroundColor: "#FFFFFF", // Pure white for clarity and focus
  contentSlideBackgroundColor: "#EDEDED", // A subtle grey for the content slides, offering a soft but professional backdrop
};

const CalmReassureTheme: Theme = {
  name: "Calm Ocean",
  titleFont: "Arial", // A universal, professional font that's clear and accessible
  titleFontSize: 30,
  titleColor: "#0277BD", // A deep ocean blue for strong, confident titles
  titleBold: true,
  subtitleFont: "Arial", // Consistency with the title font for a cohesive look
  subtitleFontSize: 24,
  subtitleColor: "#4DB6AC", // A soothing seafoam green for subtitles, evoking calm waters
  subtitleItalic: false,
  titleSlideBackgroundColor: "#E0F7FA", // A very pale, sky-like blue for a light, airy feel on the title slide
  contentSlideBackgroundColor: "#ECEFF1", // A soft, sandy off-white for content slides, providing a clean, neutral background
};

// Updated function to apply a theme to a slide, including background colors, bullet points, and images
function applyThemeToSlide(
  slide: PptxGenJS.Slide,
  content: Slide,
  theme: Theme,
  isFirstSlide: boolean = false
) {
  // Set background color based on whether it's the first slide
  slide.background = {
    color: isFirstSlide
      ? theme.titleSlideBackgroundColor
      : theme.contentSlideBackgroundColor,
  };

  // Add title text
  slide.addText(content.title, {
    x: 0.5,
    y: 0.5,
    fontFace: theme.titleFont,
    fontSize: theme.titleFontSize,
    color: theme.titleColor,
    bold: theme.titleBold,
  });

  // Add subtitle text if present
  if (content.subtitle) {
    slide.addText(content.subtitle, {
      x: 0.5,
      y: 1,
      fontFace: theme.subtitleFont,
      fontSize: theme.subtitleFontSize,
      color: theme.subtitleColor,
      italic: theme.subtitleItalic,
    });
  }

  // Process bullet points if present
  if (content.bullets) {
    const bulletPoints = content.bullets.map((bullet) => ({
      text: bullet,
      options: {
        bullet: true,
        indentLevel: 0,
        fontFace: theme.subtitleFont,
        fontSize: theme.subtitleFontSize - 2,
        color: theme.subtitleColor,
      },
    }));

    slide.addText(bulletPoints, {
      x: 0.76,
      y: 1.75,
      w: 4,
      h: 3,
      valign: "top", // Align text to the top of the box
    });
  }

  // Add image if present
  if (content.image) {
    slide.addImage({
      path: content.image.url,
      x: 5,
      y: 1,
      w: 4,
      h: 3,
    });

    // Optionally, add a caption for the image
    if (content.image.caption) {
      slide.addText(content.image.caption, {
        x: 5,
        y: 4.1,
        w: 4,
        h: 0.5,
        fontFace: theme.subtitleFont,
        fontSize: theme.subtitleFontSize - 2, // Slightly smaller than the subtitle font size
        color: theme.subtitleColor,
        align: "center",
      });
    }
  }
}

// Main function updated to use all themes and apply background colors
export async function generatePowerPointFromSlideshow(
  slideshow: Slideshow,
  themeName: string
) {
  let pptx = new PptxGenJS();
  let theme: Theme;

  // Expanded to include all themes
  switch (themeName) {
    case "earthy":
      theme = EarthyTheme;
      break;
    case "corporate":
      theme = CorporateTheme;
      break;
    case "classic":
      theme = ClassicTheme;
      break;
    case "confidence":
      theme = ConfidenceTheme;
      break;
    case "calm":
      theme = CalmReassureTheme;
      break;
    default:
      theme = ClassicTheme;
  }

  // Create the title slide and apply the theme, marking it as the first slide
  const titleSlide = pptx.addSlide();
  const titleContent = {
    title: slideshow.titleSlide.presentationName,
    subtitle: slideshow.titleSlide.presentationSubtitle,
  };
  applyThemeToSlide(titleSlide, titleContent, theme, true);

  // Process each content slide in the slideshow and apply the theme
  slideshow.slides.forEach((slideContent, index) => {
    let pptxSlide = pptx.addSlide();
    applyThemeToSlide(pptxSlide, slideContent, theme, index === 0);
  });

  return pptx.stream();
}
