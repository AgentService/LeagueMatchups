// ImageUrlHelper.js
class ImageUrlHelper {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getChampionImageSource(type, championId) {
    let imagePath = "";
    switch (type) {
      case "small":
        imagePath = `/champions/${championId}.png`;
        break;
      case "loading":
        imagePath = `/champion_loading/${championId}.png`;
        break;
      case "splash":
        imagePath = `/champion_splash/${championId}.png`;
        break;
      case "tiles":
        imagePath = `/tiles/${championId}_0.jpg`;
        break;
      default:
        // Handle the case where the type does not match
        imagePath = ""; // or some default path
        break;
    }

    return this.baseUrl + imagePath;
  }

  getSummonerIconUrl(iconId) {
    if (!iconId) return "";
    return `${this.baseUrl}/dragontail/13.21.1/img/profileicon/${iconId}.png`;
  }

  getItemImageUrl(itemId) {
    if (!itemId) return "";
    return `${this.baseUrl}/items/${itemId}.png`;
  }
  // You can add similar methods for passive, spell, summoner icons, etc.
}

export default ImageUrlHelper;
