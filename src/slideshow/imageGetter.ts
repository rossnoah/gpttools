import axios from "axios";

export const getImage = async (imageQuery: string) => {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY; // Access your Unsplash Access Key from environment variables
  try {
    const response = await axios.get(`https://api.unsplash.com/search/photos`, {
      params: {
        query: imageQuery,
        client_id: accessKey,
      },
    });

    const url: string = response.data.results[0].urls.regular;
    const photographer: string = response.data.results[0].user.name;
    const attribution: string = `Photo by ${photographer} on Unsplash`;

    return { url, attribution };
  } catch (error) {
    console.error(error);
    return { imageQuery }; // Handle errors or return a default image
  }
};
