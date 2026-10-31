import { Prisma } from "@/generated/prisma/client";

const hasCode = (err: unknown, code: string) => err instanceof Prisma.PrismaClientKnownRequestError && err.code === code;

export const isNotFoundError = (err: unknown) => hasCode(err, "P2025");

export const isUniqueError = (err: unknown) => hasCode(err, "P2002");
