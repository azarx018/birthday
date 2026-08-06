import { initPreloaderScene } from "./scene/scene-preloader.js";
import { createWelcomeScene } from "./scene/scene-welcome.js";
import { createBirthdayScene } from "./scene/scene-birthday.js";
import { createGiftScene } from "./scene/scene-gift.js";
import { createMemoryScene } from "./scene/scene-memory.js";
import { createFunMemoriesScene } from "./scene/scene-fun-memories.js";
import { createStarsScene } from "./scene/scene-stars.js";
import { createQuizScene } from "./scene/scene-quiz.js";
import { createVideoScene } from "./scene/scene-video.js";
import { createCallScene } from "./scene/scene-call.js";
import { createTalkingPhotoScene } from "./scene/scene-talking-photo.js";
import { createLetterScene } from "./scene/scene-letter.js";
import { createFinalGiftScene } from "./scene/scene-final-gift.js";
import { createEndingScene } from "./scene/scene-ending.js";
import { createPhotoboothScene } from "./scene/scene-photobooth.js";
import { createScrapbookScene } from "./scene/scene-scrapbook.js";
import { registerScene, goToScene } from "./router.js";

document.addEventListener("DOMContentLoaded", () => {
  registerScene(
    "scene-welcome",
    createWelcomeScene({
      onFinished: () => {
        goToScene("scene-birthday");
      },
    })
  );

  registerScene(
    "scene-birthday",
    createBirthdayScene({
      onOpenGift: () => {
        goToScene("scene-gift");
      },
    })
  );

  registerScene(
    "scene-gift",
    createGiftScene({
      onFinished: () => {
        goToScene("scene-memory");
      },
    })
  );

  registerScene(
    "scene-memory",
    createMemoryScene({
      onFinished: () => {
        goToScene("scene-fun-memories");
      },
    })
  );

  registerScene(
    "scene-fun-memories",
    createFunMemoriesScene({
      onAllUnlocked: () => {
        goToScene("scene-stars");
      },
    })
  );

  registerScene(
    "scene-stars",
    createStarsScene({
      onAllCollected: () => {
        goToScene("scene-quiz");
      },
    })
  );

  registerScene(
    "scene-quiz",
    createQuizScene({
      onFinished: () => {
        goToScene("scene-video");
      },
    })
  );

  registerScene(
    "scene-video",
    createVideoScene({
      onFinished: () => {
        goToScene("scene-call");
      },
    })
  );

  registerScene(
    "scene-call",
    createCallScene({
      onFinished: () => {
        goToScene("scene-talking-photo");
      },
    })
  );

  registerScene(
    "scene-talking-photo",
    createTalkingPhotoScene({
      onFinished: () => {
        goToScene("scene-letter");
      },
    })
  );

  registerScene(
    "scene-letter",
    createLetterScene({
      onFinished: () => {
        goToScene("scene-final-gift");
      },
    })
  );

  registerScene(
    "scene-final-gift",
    createFinalGiftScene({
      onFinished: () => {
        goToScene("scene-ending");
      },
    })
  );

  registerScene(
    "scene-ending",
    createEndingScene({
      onFinished: () => {
        goToScene("scene-photobooth");
      },
    })
  );

  registerScene(
    "scene-photobooth",
    createPhotoboothScene({
      onFinished: () => {
        goToScene("scene-scrapbook");
      },
    })
  );

  registerScene(
    "scene-scrapbook",
    createScrapbookScene({
      onFinished: () => {
        // "Lihat Lagi Dari Awal" — skip loading screen, langsung ke Welcome.
        goToScene("scene-welcome");
      },
    })
  );

  initPreloaderScene(() => {
    goToScene("scene-welcome");
  });
});
