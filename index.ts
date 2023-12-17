import * as yup from 'yup';
import zod from 'zod';

const results = [] as any[];

function expectThrow<T>(fn: () => T) {
  try {
    fn();
    console.error('Expected error not thrown');
    return null;
  } catch (err) {
    return err as Error;
  }
}

async function test(name: string, fn: () => Promise<readonly any[]>) {
  results.push({ name, result: await fn() });
}

test('string', async () => {
  const yupSchema = yup.string();
  const zodSchema = zod.string();
  type YupType = yup.InferType<typeof yupSchema>;
  type ZodType = zod.infer<typeof zodSchema>;

  return [
    await yupSchema.isValid('hi' as YupType),
    // await yupSchema.isValid(1 as YupType),
    zodSchema.parse('hi' as ZodType),
    // expectThrow(() => zodSchema.parse(1 as ZodType)),
  ];
});

test('email', async () => {
  const yupSchema = yup.string().email();
  const zodSchema = zod.string().email();
  type YupType = yup.InferType<typeof yupSchema>;
  type ZodType = zod.infer<typeof zodSchema>;

  return [
    await yupSchema.isValid('a@b.com' as YupType),
    await yupSchema.isValid('hi' as YupType),
    zodSchema.parse('a@b.com' as ZodType),
    expectThrow(() => zodSchema.parse('hi' as ZodType)),
  ];
});

test('object', async () => {
  const yupSchema = yup.object({
    name: yup.string().required(),
    age: yup.number(),
  });

  const zodSchema = zod.object({
    name: zod.string(),
    age: zod.number().optional(),
  });

  type YupType = yup.InferType<typeof yupSchema>;
  type ZodType = zod.infer<typeof zodSchema>;

  return [
    await yupSchema.isValid({ name: 'John' } as YupType),
    // await yupSchema.isValid({ name: "John", age: true } as YupType),
    zodSchema.parse({ name: 'John' } as ZodType),
    // expectThrow(() => zodSchema.parse({ name: "John", age: true } as ZodType)),
  ];
});

test('array', async () => {
  const yupSchema = yup.array().of(yup.number()).min(2).min(4);
  const zodSchema = zod.array(zod.number()).min(2).max(4);
  type YupType = yup.InferType<typeof yupSchema>;
  type ZodType = zod.infer<typeof zodSchema>;

  return [
    await yupSchema.isValid([1, 2] as YupType),
    await yupSchema.isValid([1, 2, 3, 4] as YupType),
    await yupSchema.isValid([1] as YupType),
    await yupSchema.isValid([1, 2, 3, 4, 5] as YupType),
    // await yupSchema.isValid(["foo", "bar"] as YupType),
    zodSchema.parse([1, 2] as ZodType),
    zodSchema.parse([1, 2, 3, 4] as ZodType),
    expectThrow(() => zodSchema.parse([1] as ZodType)),
    expectThrow(() => zodSchema.parse([1, 2, 3, 4, 5] as ZodType)),
    // expectThrow(() => zodSchema.parse(["foo", "bar"] as ZodType)),
  ];
});

test('tuple', async () => {
  const yupSchema = yup.tuple([yup.string(), yup.number()]);
  const zodSchema = zod.tuple([zod.string(), zod.number()]);
  type YupType = yup.InferType<typeof yupSchema>;
  type ZodType = zod.infer<typeof zodSchema>;

  return [
    await yupSchema.isValid(['hi', 2] as YupType),
    await yupSchema.isValid([undefined, undefined] as YupType),
    zodSchema.parse(['hi', 2] as ZodType),
    // zodSchema.parse([undefined, undefined] as ZodType),
  ];
});

test('union', async () => {
  const yupSchema = yup.mixed().oneOf([yup.string(), yup.number()]);
  const zodSchema = zod.union([zod.string(), zod.number()]);
  type YupType = yup.InferType<typeof yupSchema>; // AnyPresentValue | undefined
  type ZodType = zod.infer<typeof zodSchema>; // string | number

  return [
    await yupSchema.isValid('hi' as YupType),
    await yupSchema.isValid(1 as YupType),
    await yupSchema.isValid(true as YupType),
    zodSchema.parse('hi' as ZodType),
    zodSchema.parse(1 as ZodType),
    // zodSchema.parse(true as ZodType),
  ];
});

test('intersection', async () => {
  // const yupSchema = yup.???
  const zodSchema = zod.intersection(
    zod.object({ name: zod.string() }),
    zod.object({ age: zod.number() })
  );
  // type YupType = yup.InferType<typeof yupSchema>;
  type ZodType = zod.infer<typeof zodSchema>; // { name: string; } & { age: number; }

  return [
    zodSchema.parse({ name: 'John', age: 30 } as ZodType),
    expectThrow(() => zodSchema.parse({ name: 'John' } as ZodType)), // WAT
    // expectThrow(() => zodSchema.parse({ age: 'John' } as ZodType)),
  ];
});
