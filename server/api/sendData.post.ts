export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const parsedUrl = new URL(body.url);
  const params = Object.fromEntries(parsedUrl.searchParams.entries());
  console.log(params);

  params.appr1 = body.approver || "";

  const newQuery = new URLSearchParams(params).toString();
  const finalUrl = `${parsedUrl.origin}${parsedUrl.pathname}?${newQuery}`;

  const response = await $fetch(finalUrl);

  console.log(finalUrl);

  return finalUrl;
});
