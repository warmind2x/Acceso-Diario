export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event);
  const urlraw = form?.find((f) => f.name === "url");
  const url = urlraw?.data?.toString() || "";

  if (!url)
    throw createError({ statusCode: 400, statusMessage: "No url provided" });

  const response = await $fetch(url);

  return response;
});
