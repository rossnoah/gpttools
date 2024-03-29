import axios from "axios";
import { url } from "inspector";

export const getImage = async (imageQuery: string) => {
  const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY; // Access your Unsplash Access Key from environment variables
  const pixabayApiKey = process.env.PIXABAY_API_KEY; // Access your Pixabay API Key from environment variables

  try {
    const unsplashResponse = await axios.get(
      `https://api.unsplash.com/search/photos`,
      {
        params: {
          query: imageQuery,
          client_id: unsplashAccessKey,
        },
      }
    );

    if (unsplashResponse.status !== 200) {
      throw new Error(
        `Unsplash request failed with status code ${unsplashResponse.status}`
      );
    }

    const unsplashUrl = unsplashResponse.data.results[0].urls.regular;
    const photographer = unsplashResponse.data.results[0].user.name;
    const unsplashAttribution = `Photo by ${photographer} on Unsplash`;

    return { url: unsplashUrl, attribution: unsplashAttribution };
  } catch (unsplashError) {
    // console.error("Unsplash request failed:", unsplashError);
    console.error("Unsplash request failed:");

    try {
      const pixabayResponse = await axios.get(`https://pixabay.com/api/`, {
        params: {
          key: pixabayApiKey,
          q: imageQuery,
          image_type: "photo",
        },
      });

      if (pixabayResponse.status !== 200) {
        throw new Error(
          `Pixabay request failed with status code ${pixabayResponse.status}`
        );
      }

      const pixabayUrl = pixabayResponse.data.hits[0].webformatURL;
      const pixabayAttribution = "Image from Pixabay"; // Pixabay images are royalty-free and don't require attribution, but it's good practice to give credit

      return { url: pixabayUrl, attribution: pixabayAttribution };
    } catch (pixabayError) {
      //   console.error("Pixabay request failed:", pixabayError);
      console.error("Pixabay request failed:");

      return { url: "", attribution: "" }; // Handle errors or return a default message
    }
  }
};
