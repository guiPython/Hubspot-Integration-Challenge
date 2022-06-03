class Email {
  readonly value: string;

  private static isValid(value: string): boolean {
    return (
      !value.startsWith("@") && !value.endsWith("@") && value.search("@") !== -1
    );
  }

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Email {
    if (!Email.isValid(value)) {
      throw new Error(
        "Invalid email, must be contains '@' and can`t and with '@'"
      );
    } else {
      return new Email(value);
    }
  }

  get domain(): string {
    return this.value.split("@")[1];
  }
}

export { Email };
