import store from "../../store";

class ImageUrlHelper {
  constructor() {
    this.version = store.state.init.currentGameVersion; // Example version, this should be updated as needed
    this.baseVersionedUrl =
      "https://ddragon.leagueoflegends.com/cdn/" + this.version;
    this.baseUnversionedUrl = "https://ddragon.leagueoflegends.com/cdn";
  }

  getChampionImageSource(type, championId) {
    let imagePath = "";
    // Decide which base URL to use based on the type of image
    let baseUrl = this.baseVersionedUrl;
    switch (type) {
      case "small":
        imagePath = `/img/champion/${championId}.png`;
        break;
      case "loading":
        imagePath = `/img/champion/loading/${championId}_0.jpg`;
        break;
      case "splash":
        // Splash images are version-independent
        baseUrl = this.baseUnversionedUrl;
        imagePath = `/img/champion/splash/${championId}_0.jpg`;
        break;
      case "tiles":
        // Example path; adjust based on actual usage
        imagePath = `/img/tiles/${championId}_0.jpg`;
        break;
      default:
        imagePath = ""; // or some default path
        break;
    }

    return `${baseUrl}${imagePath}`;
  }

  getPassiveImageUrl(passive) {
    if (!passive?.image?.full) return "";
    // Construct the URL for the passive image using the versioned baseUrl
    const imagePath = `/img/passive/${passive.image.full}`;
    return `${this.baseVersionedUrl}${imagePath}`;
  }

  getSpellImageUrl(spell) {
    if (!spell?.image?.full) return "";
    // Construct the URL for the spell image using the versioned baseUrl
    const imagePath = `/img/spell/${spell.image.full}`;
    return `${this.baseVersionedUrl}${imagePath}`;
  }

  getSummonerIconUrl(iconId) {
    if (!iconId) return "";
    // Summoner icons are version-dependent
    return `${this.baseVersionedUrl}/img/profileicon/${iconId}.png`;
  }

  getItemImageUrl(itemId) {
    if (!itemId) return "";
    // Item images are version-dependent
    return `${this.baseVersionedUrl}/img/item/${itemId}.png`;
  }
  // Additional methods for passive, spell, summoner icons, etc., can follow the same pattern
}

export default ImageUrlHelper;
