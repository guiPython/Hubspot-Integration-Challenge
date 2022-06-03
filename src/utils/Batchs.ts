class BatchUtil<T> {
  sliceIntoChunks(collection: T[], maxItems: number): T[][] {
    let numberOfChunks = Math.floor(collection.length / maxItems);

    const remainder = collection.length % maxItems;
    numberOfChunks = remainder > 0 ? numberOfChunks + 1 : numberOfChunks;

    const numberOfItemsPerChunk = collection.length / numberOfChunks;
    const chunks: T[][] = [];
    for (let chunkIndex = 0; chunkIndex < numberOfChunks; chunkIndex++) {
      const chunk: T[] = [];
      for (let itemIndex = 0; itemIndex < numberOfItemsPerChunk; itemIndex++) {
        chunk.push(collection.shift());
      }
      chunks.push(chunk);
    }
    return chunks;
  }
}

export { BatchUtil };
