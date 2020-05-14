type Color = 'red' | 'magenta' | 'green' | 'yellow';

export default class Logger {
  private prefix: string;

  constructor (name: string) {
    this.prefix = `[${name}]`;
  }

  private colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    magenta: "\x1b[35m",
    green: "\x1b[32m",
    yellow: "\x1b[33m"
  }

  private colorize (message: string, colorName: Color) {
    const color = this.colors[colorName];

    return `${color}${message}${this.colors.reset}`;
  }

  public info (...messages: string[]) {
    const prefix = this.colorize(this.prefix, 'green');
    console.log(prefix, ...messages);
  }

  public warn(...messages: string[]) {
    const prefix = this.colorize(this.prefix, 'yellow');
    console.warn(prefix, ...messages);
  }

  public error (...messages: string[]) {
    const prefix = this.colorize(this.prefix, 'red');
    console.error(prefix, ...messages);
  }
};