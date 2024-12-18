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

  get baseStatImageUrl() {
    return "https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/";
  }

  getChampionImageSource(type, championId) {
    let imagePath = "";
    let baseUrl = this.baseVersionedUrl; // Use the getter for dynamic access

    if (!championId) {
      return ""; // Return early if no champion
    } 
    if (championId === "FiddleSticks") {
      championId = "Fiddlesticks"; // Special case for Fiddlesticks
    }

    // Normalize championId by removing spaces (and any other necessary normalization)
    const normalizedChampionId = championId.replace(/\s+/g, '');

    switch (type) {
      case "small":
        imagePath = `/img/champion/${normalizedChampionId}.png`;
        break;
      case "loading":
        imagePath = `/img/champion/loading/${normalizedChampionId}_0.jpg`;
        break;
      case "splash":
        baseUrl = this.baseUnversionedUrl; // Splash images are version-independent
        imagePath = `/img/champion/splash/${normalizedChampionId}_0.jpg`;
        break;
      case "tiles":
        imagePath = `/img/tiles/${normalizedChampionId}_0.jpg`;
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

  getStatImageUrl(statKey) {
    const statIcons = {
      adaptiveforce: "statmodsadaptiveforceicon.png",
      adaptiveforcescaling: "statmodsadaptiveforcescalingicon.png",
      armor: "statmodsarmoricon.png",
      attackspeed: "statmodsattackspeedicon.png",
      cdr: "statmodscdrscalingicon.png",
      healthplus: "statmodshealthplusicon.png",
      hp: "statmodshealthscalingicon.png",
      spellblock: "statmodsmagicresicon.png",
      movespeed: "statmodsmovementspeedicon.png",
      tenacity: "statmodstenacityicon.png",
    };
    // Use the stat icon mapping to return the complete URL for an icon
    return `${this.baseStatImageUrl}${statIcons[statKey.toLowerCase()]}`;
  }
}

export default ImageUrlHelper;
