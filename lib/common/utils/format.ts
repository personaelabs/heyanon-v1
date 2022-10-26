export const formatCreateTreeJSONBody = (body: any) => {
    // JSON stringify is not able to serialize bigint
    body.root = body.root.toString();
    const addresses = Object.keys(body.leafToPathElements);
    addresses.map((address) => {
      // path element h(a, b) converted cast to string from bigint
      body.leafToPathElements[address] = body.leafToPathElements[address].map(
        (element: bigint) => element.toString()
      );
      // path element h(a, b) converted cast to string from number
      body.leafToPathIndices[address] = body.leafToPathIndices[address].map(
        (index: number) => index.toString()
      );
    });
    return body;
  };
  