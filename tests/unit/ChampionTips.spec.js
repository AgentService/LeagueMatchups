import { shallowMount } from "@vue/test-utils";
import ChampionTips from "@/renderer/components/ChampionTips.vue";
import { useStore } from "vuex";
import { createStore } from 'vuex';

jest.mock("vuex", () => ({
  useStore: jest.fn(() => ({
    state: {}, // Mock state
    getters: {
      "champions/getChampionTips": jest.fn().mockReturnValue({
        /* Mock return value */
        tipKey: { long: "Mocked tip content" },
      }),
    },
  })),
}));
it("computes champion tips correctly", async () => {
  const wrapper = shallowMount(ChampionTips, {
    props: {
      champion: { id: "champion1", name: "Champion One" },
      instanceId: 1,
    },
  });

  // Use the same formatCategory function to ensure we have the correct text to match
  const formattedText = wrapper.vm.formatCategory("tipKey");

  // Find the button by looking for .text-content div with the matching text
  const buttons = wrapper.findAll("button");
  let foundButton;
  for (const buttonWrapper of buttons) {
    const textContentDiv = buttonWrapper.find(".text-content");
    if (
      textContentDiv.exists() &&
      textContentDiv.text().includes(formattedText)
    ) {
      foundButton = buttonWrapper;
      break;
    }
  }

  if (foundButton) {
    await foundButton.trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Mocked tip content");
  } else {
    throw new Error(
      `Button with formatted text '${formattedText}' was not found`
    );
  }
});

describe("ChampionTips.vue", () => {
  it("renders correctly with mock store", () => {
    const wrapper = shallowMount(ChampionTips, {
      props: {
        champion: { id: "champion1", name: "Champion One" },
        instanceId: 1,
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(".title-bar").text()).toContain("General Tips");
    // Other assertions to check if the component renders as expected
  });

  it("renders nothing when championTips is empty", () => {
	// Mock store to return an empty object for championTips
	useStore.mockReturnValue({
	  state: {},
	  getters: {
		"champions/getChampionTips": jest.fn().mockReturnValue({}),
	  },
	});
  
	const wrapper = shallowMount(ChampionTips, {
	  props: {
		champion: { id: "champion1", name: "Champion One" },
		instanceId: 1,
	  },
	});
  
	// Check if the component renders nothing
	expect(wrapper.html()).toBe('<!--v-if-->');
  
	// Ensure no errors are thrown and the component still exists
	expect(wrapper.exists()).toBe(true);
  });
  
  
  it("matches the snapshot", () => {
	const wrapper = shallowMount(ChampionTips, {
	  props: {
		champion: { id: "champion1", name: "Champion One" },
		instanceId: 1,
	  },
	});
	expect(wrapper.html()).toMatchSnapshot();
  });
  
  
});
  
it("renders nothing when championTips is empty", () => {
	// Mock useStore to return an empty object for championTips
	useStore.mockImplementation(() => ({
	  state: {
		champions: {
		  championTips: {}
		}
	  },
	  getters: {
		'champions/getChampionTips': () => () => ({})
	  }
	}));
  
	const wrapper = shallowMount(ChampionTips, {
	  props: {
		champion: { id: "champion1", name: "Champion One" },
		instanceId: 1,
	  },
	});
  
	// Check if the component renders nothing
	expect(wrapper.html()).toBe('<!--v-if-->');
  });

  
    it("renders correctly with different champion props", async () => {
	const wrapper = shallowMount(ChampionTips, {
	  props: {
		champion: { id: "champion2", name: "Champion Two" },
		instanceId: 2,
	  },
	});
	// Assertions to check if it renders correctly for a different champion
	expect(wrapper.vm.championId).toBe("champion2");
  });

  