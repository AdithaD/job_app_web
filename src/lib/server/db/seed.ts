import { drizzle } from "drizzle-orm/libsql";
import { seed } from "drizzle-seed";
import { dev } from "$app/environment";
import { createClient } from "@libsql/client";
import { env } from "$env/dynamic/private";
import { job, client, jobStatuses, paymentStatuses } from "$lib/server/db/schema";

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
if (!dev && !env.DATABASE_AUTH_TOKEN) throw new Error('DATABASE_AUTH_TOKEN is not set');

const dbClient = createClient({
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN
});


const USER_ID = "EKYMvKZuuJsnnKVB2nCOHxusyKKFPKec";
export async function main() {
    const db = drizzle(dbClient);
    await seed(db, { job, client }).refine((f) => ({
        job: {
            columns: {
                title: f.default({ defaultValue: "Some job title" }),
                userId: f.default({ defaultValue: USER_ID }),
                description: f.loremIpsum({ sentencesCount: 2 }),
                location: f.streetAddress(),
                scheduledDate: f.datetime(),
                jobStatus: f.valuesFromArray({ values: jobStatuses.values().toArray() }),
                paymentStatus: f.valuesFromArray({ values: paymentStatuses.values().toArray() })
            }
        },
        client: {
            columns: {
                name: f.fullName(),
                userId: f.default({ defaultValue: USER_ID }),
                phone: f.phoneNumber(),
                address: f.streetAddress(),
            }
        }
    }))
}
