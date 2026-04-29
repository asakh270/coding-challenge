"use server";

export async function getRandomNumber() {
  // Simulate some server-side work
  await new Promise((resolve) => setTimeout(resolve, 500));
  return Math.floor(Math.random() * 1000);
}
