// championUtils.js

export const getChampionImageSource = (type, championId) => {
  switch (type) {
    case "small":
      return `/img/champions/${championId}.png`;
    case "loading":
      return `/img/champion_loading/${championId}.png`;
    case "splash":
      return `/img/champion_splash/${championId}.png`;
    case "tiles":
      return `/img/tiles/${championId}_0.jpg`;
    default:
      // Handle the case where the type does not match 'small' or 'loading'
      return ""; // or some default path
  }
};
