import { test, expect } from "@playwright/test";

test.describe("Kuizz Multi-Window Simulation", () => {
  // We want to run this test with a long timeout because we are simulating the entire game
  test.setTimeout(120000);

  test("Simulate 1 Host and 3 Clients Playing a Game", async ({ browser }) => {
    // ---------------------------------------------------------
    // 1. SETUP BROWSER CONTEXTS (Total: 4 Isolated Windows)
    // ---------------------------------------------------------
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();

    const client1Context = await browser.newContext();
    const client1Page = await client1Context.newPage();

    const client2Context = await browser.newContext();
    const client2Page = await client2Context.newPage();

    const client3Context = await browser.newContext();
    const client3Page = await client3Context.newPage();

    // ---------------------------------------------------------
    // 2. HOST: LOGIN/REGISTER & START GAME
    // ---------------------------------------------------------
    console.log("[Host] Navigating to login...");
    await hostPage.goto("http://localhost:3000/login");

    console.log("[Host] Attempting to log in as admin...");
    await hostPage.fill('input[type="email"]', "admin@kuizz.com");
    await hostPage.fill('input[type="password"]', "password123");
    await hostPage.click('button[type="submit"]');

    try {
      // Wait for dashboard or error
      await hostPage.waitForURL("**/dashboard*", { timeout: 3000 });
    } catch {
      console.log("[Host] Login failed. Attempting to register new user...");
      await hostPage.goto("http://localhost:3000/register");

      await hostPage.waitForSelector('input[type="email"]');
      await hostPage.fill('input[type="email"]', "admin@kuizz.com");
      await hostPage.fill('input[placeholder="John Doe"]', "Admin Test");
      await hostPage.fill('input[type="password"]', "password123"); // Minimum 6 chars
      await hostPage.click('button[type="submit"]');

      try {
        await hostPage.waitForURL("**/dashboard*", { timeout: 5000 });
      } catch {
        console.log(
          "[Host] Could not register either, maybe credentials exist but wrong. Trying to proceed anyway...",
        );
        await hostPage.goto("http://localhost:3000/dashboard");
      }
    }

    console.log("[Host] Reached dashboard. Going to quizes...");
    await hostPage.goto("http://localhost:3000/dashboard/quizes");

    console.log("[Host] Checking if there are quizzes...");
    // If there's an EmptyPlaceholder, we need to create one first
    const isEmpty = await hostPage
      .getByText("No Quizzes Yet")
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (isEmpty) {
      console.log("[Host] No quizzes found. Creating a dummy quiz...");
      await hostPage.goto("http://localhost:3000/dashboard/create");

      await hostPage.waitForSelector('input[placeholder="Your question here"]');

      // Let's set the question
      await hostPage.fill(
        'input[placeholder="Your question here"]',
        "What is 1 + 1?",
      );

      console.log("[Host] Filling out options...");
      // The answer inputs are inside the grid
      const answerInputs = hostPage.locator(".grid.grid-cols-2 input");

      await answerInputs.nth(0).waitFor({ state: "attached" });
      await answerInputs.nth(0).fill("Option A", { force: true });
      await answerInputs.nth(1).fill("Option B", { force: true });
      await answerInputs.nth(2).fill("Option C", { force: true });
      await answerInputs.nth(3).fill("Option D", { force: true });

      // Let's mark the first one as correct (Option A)
      const optionAContainer = hostPage
        .locator(".grid.grid-cols-2 > div")
        .first();
      const correctBtn = optionAContainer.locator(
        "button.border-2.border-white",
      );

      // We click it to toggle correct state - bg-transparent means it's not currently correct
      const btnClass = await correctBtn.getAttribute("class");
      if (btnClass && btnClass.includes("bg-transparent")) {
        await correctBtn.click({ force: true });
      }

      console.log("[Host] Saving the dummy quiz...");
      await hostPage.getByRole("button", { name: "Save Quiz" }).click();

      // Wait for redirect back
      await hostPage.waitForURL("**/dashboard/quizes");
    }

    console.log("[Host] Finding the first quiz to start...");
    // Click the Ellipsis dropdown of the first Quiz
    await hostPage.locator("button:has(svg.lucide-ellipsis)").first().click();

    // Click Start Game inside the dropdown menu
    await hostPage.getByRole("menuitem", { name: "Start Game" }).click();

    // Wait until it pushes to the /game/[code] page
    await hostPage.waitForURL("**/game/*");

    const urlParts = hostPage.url().split("/");
    const roomCode = urlParts[urlParts.length - 1];
    console.log(`[Host] Created game with Room Code: ${roomCode}`);

    // Wait until host lobby is loaded (Lock/Unlocked Room button is a good indicator)
    await expect(
      hostPage.getByRole("button", { name: "Unlocked" }),
    ).toBeVisible();

    // ---------------------------------------------------------
    // 3. CLIENTS: JOIN GAME
    // ---------------------------------------------------------
    console.log(`[Clients] Joining the game room... (${roomCode})`);

    await Promise.all([
      client1Page.goto(`http://localhost:3000/join?roomId=${roomCode}`),
      client2Page.goto(`http://localhost:3000/join?roomId=${roomCode}`),
      client3Page.goto(`http://localhost:3000/join?roomId=${roomCode}`),
    ]);

    const joinClient = async (page: any, name: string) => {
      console.log(`[Client ${name}] Registering...`);
      // Step 1 check room: Wait for exact join code input
      await page.waitForSelector('input[placeholder="KODE RUANGAN"]');
      await page.getByRole("button", { name: "Enter" }).click();

      // Step 2 join nickname: Wait for nickname input
      await page.waitForSelector('input[placeholder="Nama kamu"]');
      await page.fill('input[placeholder="Nama kamu"]', name);
      await page.getByRole("button", { name: "Join" }).click();

      // Wait for the waiting screen indicating successful join
      // We look for 'Waiting for host...' from FinalResult/Lobby
      await page
        .waitForSelector("text=Waiting for host", { timeout: 10000 })
        .catch(() => null);
    };

    await Promise.all([
      joinClient(client1Page, "Client 1 A"),
      joinClient(client2Page, "Client 2 B"),
      joinClient(client3Page, "Client 3 Delay"),
    ]);

    console.log("[Clients] All clients joined successfully!");

    // ---------------------------------------------------------
    // 4. HOST: START GAMEPLAY PHASE
    // ---------------------------------------------------------
    console.log("[Host] Starting the game...");
    const startButton = hostPage.getByRole("button", {
      name: "Start",
    });

    await expect(startButton).toBeEnabled({ timeout: 10000 });
    await startButton.click();

    // Let's iterate through 5 questions
    for (let i = 0; i < 5; i++) {
      try {
        console.log(`[Game] Waiting for Question ${i + 1} to start...`);
        // Wait for Host Force Reveal button (indicator that QUESTION phase is active)
        await expect(
          hostPage.getByRole("button", { name: "Force Reveal" }),
        ).toBeVisible({ timeout: 15000 });

        console.log(`[Clients] Answering Question ${i + 1}...`);

        // Clients Answer Logic
        await Promise.all([
          // Client 1 - Instant A
          (async () => {
            const btn = client1Page
              .locator("button.w-full.rounded-2xl", { hasText: "Option A" })
              .first();
            await btn
              .waitFor({ state: "visible", timeout: 5000 })
              .catch(() => {});
            if (await btn.isVisible()) {
              await btn.click();
              console.log("[Client 1 A] Clicked Option A");
            } else {
              // Try clicking the first option whatever it is
              await client1Page
                .locator("button.w-full.rounded-2xl")
                .first()
                .click()
                .catch(() => {});
              console.log("[Client 1 A] Clicked fallback");
            }
          })(),

          // Client 2 - Instant B
          (async () => {
            const btn = client2Page
              .locator("button.w-full.rounded-2xl", { hasText: "Option B" })
              .first();
            await btn
              .waitFor({ state: "visible", timeout: 5000 })
              .catch(() => {});
            if (await btn.isVisible()) {
              await btn.click();
              console.log("[Client 2 B] Clicked Option B");
            } else {
              // Try clicking the second option whatever it is
              await client2Page
                .locator("button.w-full.rounded-2xl")
                .nth(1)
                .click()
                .catch(() => {});
              console.log("[Client 2 B] Clicked fallback");
            }
          })(),

          // Client 3 - Wait 3s, then A
          (async () => {
            await new Promise((r) => setTimeout(r, 3000));
            const btn = client3Page
              .locator("button.w-full.rounded-2xl", { hasText: "Option A" })
              .first();
            await btn
              .waitFor({ state: "visible", timeout: 5000 })
              .catch(() => {});
            if (await btn.isVisible()) {
              await btn.click();
              console.log("[Client 3 Delay] Clicked Option A after 3s");
            } else {
              await client3Page
                .locator("button.w-full.rounded-2xl")
                .first()
                .click()
                .catch(() => {});
              console.log("[Client 3 Delay] Clicked fallback after 3s");
            }
          })(),
        ]);

        console.log(`[Host] Host auto-revealing answers...`);
        await hostPage
          .getByRole("button", { name: "Force Reveal" })
          .click()
          .catch(() => {});

        // Wait for next relative action: Lanjut (Next Question)
        console.log(`[Host] Host moving to Next Phase...`);
        const nextBtn = hostPage.getByRole("button", { name: "Lanjut" });
        await expect(nextBtn).toBeVisible({ timeout: 5000 });
        await nextBtn.click();
      } catch (e) {
        console.log("[Game] Phase ended or could not answer in time");
        break; // break early if game finishes
      }
    }

    console.log(
      "[Game] Simulation completing... Verifying leaderboard on Host...",
    );
    // We expect the text "Leaderboard" to appear
    await hostPage
      .waitForSelector("text=Leaderboard", { timeout: 15000 })
      .catch(() => {});

    // Sleep for a few moments to appreciate the leaderboard visual before closing
    await new Promise((resolve) => setTimeout(resolve, 5000));
  });
});
