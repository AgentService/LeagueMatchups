import { shallowMount } from "@vue/test-utils";
import ChampionTips from "@/renderer/components/ChampionTips.vue";
import { useStore } from "vuex";

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
it("computes champion tips correctly", () => {
  const wrapper = shallowMount(ChampionTips, {
    props: {
      champion: { id: "champion1", name: "Champion One" },
      instanceId: 1,
    },
  });

  // If the component renders keys from the championTips object
  expect(wrapper.text()).toContain("Tip Key");
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

  it("computes champion tips correctly", () => {
    const wrapper = shallowMount(ChampionTips, {
      props: {
        champion: { id: "champion1", name: "Champion One" },
        instanceId: 1,
      },
    });

    // Assuming your component renders something based on the championTips computed property
    expect(wrapper.text()).toContain("Mocked tip content");
  });

  // Tests for user interactions (e.g., clicking a tip, using buttons)
  // ...
});
