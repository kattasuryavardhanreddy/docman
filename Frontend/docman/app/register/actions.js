"use server";
import { REGISTRATION_DISABLED_MESSAGE } from "./registration-status";

export async function registerAction() {
  return { error: REGISTRATION_DISABLED_MESSAGE };
}
