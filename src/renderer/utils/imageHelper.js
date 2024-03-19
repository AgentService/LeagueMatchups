import store from "../../store";

class ImageUrlHelper {
  // Removed the constructor since we are now using getters for dynamic values

  // Dynamically fetch the current game version from Vuex store whenever it's accessed
  get version() {
    return store.state.init.currentGameVersion;
  }

  // Dynamically construct the baseVersionedUrl using the current version
  get baseVersionedUrl() {
    return `https://ddragon.leagueoflegends.com/cdn/${this.version}`;
  }

  // Static value, does not depend on the version
  get baseUnversionedUrl() {
    return "https://ddragon.leagueoflegends.com/cdn";
  }

  getChampionImageSource(type, championId) {
    let imagePath = "";
    // Now using getters to dynamically decide the base URL
    let baseUrl = this.baseVersionedUrl; // This now uses the getter for dynamic access
    switch (type) {
      case "small":
        imagePath = `/img/champion/${championId}.png`;
        break;
      case "loading":
        imagePath = `/img/champion/loading/${championId}_0.jpg`;
        break;
      case "splash":
        baseUrl = this.baseUnversionedUrl; // Splash images are version-independent
        imagePath = `/img/champion/splash/${championId}_0.jpg`;
        break;
      case "tiles":
        imagePath = `/img/tiles/${championId}_0.jpg`;
        break;
      default:
        imagePath = ""; // Or some default path
        break;
    }

    return `${baseUrl}${imagePath}`;
  }

  getPassiveImageUrl(passive) {
    if (!passive?.image?.full) return "";
    const imagePath = `/img/passive/${passive.image.full}`;
    return `${this.baseVersionedUrl}${imagePath}`;
  }

  getSpellImageUrl(spell) {
    if (!spell?.image?.full) return "";
    const imagePath = `/img/spell/${spell.image.full}`;
    return `${this.baseVersionedUrl}${imagePath}`;
  }

  getSummonerIconUrl(iconId) {
    if (!iconId) return "";
    return `${this.baseVersionedUrl}/img/profileicon/${iconId}.png`;
  }

  getItemImageUrl(itemId) {
    if (!itemId) return "";
    return `${this.baseVersionedUrl}/img/item/${itemId}.png`;
  }
}

export default ImageUrlHelper;
