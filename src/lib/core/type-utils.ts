export type Writeable<T> = { -readonly [P in keyof T]: T[P] };
export type Exact<T, U> = IfEquals<T, U, T, never>;
export type IfEquals<T, U, Y = unknown, N = never> = (<G>() => G extends T ? 1 : 2) extends
    (<G>() => G extends U ? 1 : 2) ? Y
    : N;
export type NotAny<T> = 0 extends (1 & T) ? never : T;
