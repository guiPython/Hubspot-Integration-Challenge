type ICommandResponse<TResponse> = {
  status: true;
  value: TResponse;
};

type ErrorOnRunCommand = {
  status: false;
  value: Error;
};

interface ICommand<TResponse> {
  execute(): Promise<ICommandResponse<TResponse> | ErrorOnRunCommand>;
}

export { ICommand, ICommandResponse, ErrorOnRunCommand };
