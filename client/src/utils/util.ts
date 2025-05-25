import xSoundFile from "../assets/click1.wav";
import ySoundFile from "../assets/click2.wav";
import gameOverSoundFile from "../assets/winSound2.mp3";
import drawSoundFile from "../assets/draw-sound.wav";
import notification from "../assets/notification.mp3";

export function toggleFullScreen() {
  //Its bitt of mess becuase of typescript
  const element = document.documentElement as unknown as {
    requestFullscreen: () => void;
    webkitRequestFullscreen: () => void;
    mozRequestFullScreen: () => void;
    msRequestFullscreen: () => void;
  };
  const doc = document as unknown as {
    exitFullscreen: () => void;
    mozFullScreenElement: () => void;
    msFullscreenElement: () => void;
    fullscreenElement: () => void;
    webkitExitFullscreen: () => void;
    mozCancelFullScreen: () => void;
    msExitFullscreen: () => void;
    webkitFullscreenElement: () => void;
  };
  if (
    !doc.fullscreenElement &&
    !doc.webkitFullscreenElement &&
    !doc.mozFullScreenElement &&
    !doc.msFullscreenElement
  ) {
    // Enter fullscreen
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen(); // Safari
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen(); // Firefox
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen(); // IE/Edge
    }
  } else {
    // Exit fullscreen
    if (doc.exitFullscreen) {
      doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen(); // Safari
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen(); // Firefox
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen(); // IE/Edge
    }
  }
}

const xSound = new Audio(xSoundFile);
const ySound = new Audio(ySoundFile);
const winSound = new Audio(gameOverSoundFile);
const drawSound = new Audio(drawSoundFile);
const notificationSound = new Audio(notification);

[xSound, ySound, winSound, drawSound].forEach((sound) => {
  sound.preload = "auto";
  sound.load(); // 👈 This triggers preloading
});

// Utility function to check if sound is enabled
const isSoundOn = () => sessionStorage.getItem("soundOn") !== "0";

// Sound Player Functions
export const gameSound = {
  xSound: () => isSoundOn() && xSound.play(),
  ySound: () => isSoundOn() && ySound.play(),
  winSound: () => isSoundOn() && winSound.play(),
  drawSound: () => isSoundOn() && drawSound.play(),
  notificationSound: () => isSoundOn() && notificationSound.play(),
  setSoundOn: (v: boolean) => sessionStorage.setItem("soundOn", v ? "1" : "0"),
  isSoundOn: isSoundOn,
};

export function initSession() {
  if (!localStorage.getItem("sid")) {
    const sid = (Date.now() + Math.floor(Math.random() * 100000)).toString(36);
    localStorage.setItem("sid", sid);
  }
}

export function getSession() {
  initSession();
  return localStorage.getItem("sid")!;
}

export const joinCls = (...params: Array<unknown>) => {
  return params.filter(Boolean).join(" ");
};
