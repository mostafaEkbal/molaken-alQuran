export const graphqlRequest = async (query: string, variables?: any) => {
    const response = await fetch(process.env.EXPO_PUBLIC_API_URL + "/graphql", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
    
    const json = await response.json();
    if (json.errors) {
      throw new Error(json.errors[0].message);
    }
    return json.data;
  };