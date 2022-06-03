interface IQuery<T, TResult> {
  execute(param: T): Promise<TResult>;
}

export { IQuery };
