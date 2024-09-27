type ApiResponse = {
  total: number;
  count: number;
  products: any[];
};

async function fetchProducts(
  minPrice: number,
  maxPrice: number
): Promise<ApiResponse> {
  const url = `https://api.ecommerce.com/products?minPrice=${minPrice}&maxPrice=${maxPrice}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`problem occured in response: ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.log(`error occured in fetching: ${error}`);
    throw error;
  }
}

// the result array (array of any as we dont care whats inside the product objects)
let products: any[] = [];

// constants from the assignment
const MIN_PRICE = 0;
const MAX_PRICE = 100000;
const MAX_NUMBER_OF_RESULTS = 1000;

// function with side effect to accumulate products into the "products" array
async function fetchAllProducts(minPrice: number, maxPrice: number) {
  let stack = [{ minPrice, maxPrice }];

  while (stack.length > 0) {
    const { minPrice, maxPrice } = stack.pop()!;

    // avoid further spliting when there is no sense in it
    if (minPrice >= maxPrice) {
      continue;
    }

    const result: ApiResponse = await fetchProducts(minPrice, maxPrice);

    // avoid unnecessary processing if there are no products in this array
    // - if the range is too narrow, we cant get all the products as we only have minPrice and maxPrice query parameters
    // - so at least we terminate the execution to avoid duplicates
    if (result.total === 0) {
      continue;
    }

    if (result.total <= MAX_NUMBER_OF_RESULTS) {
      // add the products to the result array, if there are no more than 1000 of them
      products = products.concat(result.products);
    } else {
      // if there is more than 1000 products split the range and push it to the stack
      const midPrice = Math.floor((minPrice + maxPrice) / 2);
      stack.push({ minPrice: midPrice + 1, maxPrice });
      stack.push({ minPrice, maxPrice: midPrice });
    }
  }
}

async function getAllProducts() {
  await fetchAllProducts(MIN_PRICE, MAX_PRICE);
}

getAllProducts();

// *** EXPECTATIONS ***:
// 1. all the assumptions from the assignment, like API response format etc.
// 2. API is stable, quick and doesnt have limits for requests
//    - we can add a small delay for requests in case of requests
// 3. data doesnt change between requests (like when someone adds some products during iterarions)
// 4. the range isnt too narrow (so we cant get all the products by chunking them according to price)
