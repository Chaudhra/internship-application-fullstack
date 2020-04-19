/**
 * Returns the variant url held in the cookie
 * @param {Cookie} cookie
 */
const extractCookie = (cookie) => {
  // Check the cookie to see which variant of the url is stored, return it
  if (cookie.includes('https://cfw-takehome.developers.workers.dev/variants/1')) {
    return 'https://cfw-takehome.developers.workers.dev/variants/1';
  } else {
    return 'https://cfw-takehome.developers.workers.dev/variants/2';
  }
}


addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});


/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const properties = {
    method: 'GET',
    headers: {
      'credentials': 'same-origin'
    }
  };

  // Extra Credit 1 - Changing copy/URLs
  const rewriter = new HTMLRewriter()
    .on('h1#title', {
      element: e => e.append('is SUPER COOL!!')
    })
    .on('title', {
      element: e => e.setInnerContent('Adils Internship Application')
    })
    .on('p#description', {
      element: e => e.append(' Extra credit has been completed!')
    })
    .on('a#url', {
      element: e => {
        e.setAttribute('href', 'https://www.google.com')
        e.setInnerContent('Go to Google.com')
      }
    });

  const response = await fetch('https://cfw-takehome.developers.workers.dev/api/variants');
  const data = await response.json();
  const urlsListArray = data.variants;

  // Distribute requests between variants 50/50
  const variantIndex = Math.random() < 0.5 ? 0 : 1;
  let selectedVariant = urlsListArray[variantIndex];

  // Extra Credit 2 - Presisting variants
  // Check to see if a cookie exists, if it does, we use the url that comes back from extractCookie, as the selectedVariant value
  const cookie = request.headers.get('Cookie');
  if (cookie !== null) {
    // The following line can be commented out to exclude cookie functionality
    selectedVariant = extractCookie(cookie);
  }

  // Fetch the selected variant
  let newResponse = await fetch(selectedVariant, properties);
  // Copy the response object so we can modify it
  newResponse = new Response(newResponse.body, newResponse);
  // Set a cookie with the value of the current variant 
  newResponse.headers.append('Set-Cookie', `selectedVariantURL = ${selectedVariant}; path=/`);

  return rewriter.transform(newResponse);
}