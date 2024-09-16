import { AccessTracker } from "../mappings/access-tracker.js";

const testObj = {
    prop1: "value1",
    prop2: {
        nestedProp1: "nestedValue1",
        nestedProp2: "nestedValue2",
    },
    prop3: [1, 2, 3],
    prop4: {
        deepNested: {
            level1: "deep1",
            level2: "deep2",
        },
    },
};

describe("AccessTracker", () => {
    let tracker: AccessTracker<typeof testObj>;

    beforeEach(() => {
        tracker = new AccessTracker(testObj);
    });

    it("isAllPropertiesAccessed returns false initially", () => {
        expect(tracker.isAllPropertiesAccessed()).toBe(false);
    });

    it("should not mutate the original object", () => {
        tracker.proxy.prop1;
        expect(testObj).toEqual({
            prop1: "value1",
            prop2: {
                nestedProp1: "nestedValue1",
                nestedProp2: "nestedValue2",
            },
            prop3: [1, 2, 3],
            prop4: {
                deepNested: {
                    level1: "deep1",
                    level2: "deep2",
                },
            },
        });
    });

    it("accessing properties marks them as accessed", () => {
        tracker.proxy.prop1;
        tracker.proxy.prop2;
        expect(tracker.getAccessedProperties()).members(["prop1", "prop2"]);
    });

    it("accessing nested properties marks them as accessed", () => {
        tracker.proxy.prop2.nestedProp1;
        expect(tracker.getAccessedProperties()).members(["prop2.nestedProp1", "prop2"]);
    });

    it("getUnaccessedProperties returns unaccessed properties", () => {
        tracker.proxy.prop1;
        expect(tracker.getUnaccessedProperties()).toEqual([
            "prop2",
            "prop2.nestedProp1",
            "prop2.nestedProp2",
            "prop3",
            "prop3.0",
            "prop3.1",
            "prop3.2",
            "prop4",
            "prop4.deepNested",
            "prop4.deepNested.level1",
            "prop4.deepNested.level2",
        ]);
    });

    it("isAllPropertiesAccessed returns true when all properties are accessed", () => {
        tracker.proxy.prop1;
        tracker.proxy.prop2.nestedProp1;
        tracker.proxy.prop2.nestedProp2;
        tracker.proxy.prop3[0];
        tracker.proxy.prop3[1];
        tracker.proxy.prop3[2];
        tracker.proxy.prop4.deepNested;
        tracker.proxy.prop4.deepNested.level1;
        tracker.proxy.prop4.deepNested.level2;
        expect(tracker.isAllPropertiesAccessed()).toBe(true);
    });

    it("hasProperty returns true for existing properties", () => {
        expect(tracker.hasProperty("prop1")).toBe(true);
        expect(tracker.hasProperty("prop2.nestedProp1")).toBe(true);
    });

    it("hasProperty returns false for non-existing properties", () => {
        expect(tracker.hasProperty("nonExistentProp")).toBe(false);
    });

    it("removePropertiesUnderPath removes specified properties", () => {
        tracker.removePropertiesUnderPath("prop2");
        expect(tracker.hasProperty("prop2")).toBe(false);
        expect(tracker.hasProperty("prop2.nestedProp")).toBe(false);
    });

    it("touchPath marks properties as accessed", () => {
        tracker.touchPath("prop2");
        expect(tracker.getAccessedProperties()).members(["prop2", "prop2.nestedProp1", "prop2.nestedProp2"]);
    });

    it("removePropertiesUnderPath removes properties using wildcard", () => {
        tracker.removePropertiesUnderPath("prop2.*");
        expect(tracker.hasProperty("prop2")).toBe(true);
        expect(tracker.hasProperty("prop2.nestedProp1")).toBe(false);
        expect(tracker.hasProperty("prop2.nestedProp2")).toBe(false);
    });

    it("removePropertiesUnderPath removes deep nested properties using wildcard", () => {
        tracker.removePropertiesUnderPath("prop4.*");
        expect(tracker.hasProperty("prop4")).toBe(true);
        expect(tracker.hasProperty("prop4.deepNested.level1")).toBe(false);
        expect(tracker.hasProperty("prop4.deepNested.level2")).toBe(false);
        expect(tracker.hasProperty("prop1")).toBe(true);
    });

    it("touchPath marks properties as accessed using wildcard", () => {
        tracker.touchPath("prop2");
        expect(tracker.getAccessedProperties()).members(["prop2", "prop2.nestedProp1", "prop2.nestedProp2"]);
    });

    it("touchPath marks deep nested properties as accessed using wildcard", () => {
        tracker.touchPath("prop4");
        expect(tracker.getAccessedProperties()).toContain("prop4");
        expect(tracker.getAccessedProperties()).toContain("prop4.deepNested");
        expect(tracker.getAccessedProperties()).toContain("prop4.deepNested.level1");
        expect(tracker.getAccessedProperties()).toContain("prop4.deepNested.level2");
    });

    it("touchPath should work correctly with multiple wildcards", () => {
        tracker.touchPath("*.deepNested.*");
        expect(tracker.getAccessedProperties()).members(["prop4.deepNested.level1", "prop4.deepNested.level2"]);
    });

    it("removePropertiesUnderPath should work correctly with multiple wildcards", () => {
        tracker.removePropertiesUnderPath("*.deepNested.*");
        expect(tracker.hasProperty("prop4.deepNested.level1")).toBe(false);
        expect(tracker.hasProperty("prop4.deepNested.level2")).toBe(false);
        expect(tracker.hasProperty("prop4.deepNested")).toBe(true);
    });

    it("should partially clone all correctly", () => {
        const cloned = tracker.clone();
        expect(cloned).toStrictEqual(testObj);
    });

    it("should partially clone a set of paths", () => {
        const cloned = tracker.partiallyClone(["prop1", "prop2.nestedProp1"]);
        expect(cloned).toStrictEqual({
            prop1: "value1",
            prop2: {
                nestedProp1: "nestedValue1",
            },
        });
    });

    it("should partially clone a set of paths with wildcard", () => {
        const cloned = tracker.partiallyClone(["prop2.*"]);
        expect(cloned).toStrictEqual({
            prop2: {
                nestedProp1: "nestedValue1",
                nestedProp2: "nestedValue2",
            },
        });
    });

    it("should clone accessed properties correctly", () => {
        tracker.proxy.prop1;
        tracker.proxy.prop2.nestedProp1;
        const cloned = tracker.cloneAccessed();
        expect(cloned).toStrictEqual({
            prop1: "value1",
            prop2: {
                nestedProp1: "nestedValue1",
            },
        });
    });

    it("should clone unaccessed properties correctly", () => {
        tracker.proxy.prop1;
        tracker.proxy.prop2.nestedProp1;
        const cloned = tracker.cloneUnaccessed();
        expect(cloned).toStrictEqual({
            prop2: {
                nestedProp2: "nestedValue2",
            },
            prop3: [1, 2, 3],
            prop4: {
                deepNested: {
                    level1: "deep1",
                    level2: "deep2",
                },
            },
        });
    });
});
