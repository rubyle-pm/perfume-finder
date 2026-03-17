"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeIntentScore = computeIntentScore;
var intent_map_1 = require("./intent-map");
function normalizeDescriptor(descriptor) {
    if (descriptor === "powdery")
        return ["powdery", "floral"];
    return [descriptor];
}
function expandDescriptors(descriptors) {
    var expanded = new Set();
    for (var _i = 0, descriptors_1 = descriptors; _i < descriptors_1.length; _i++) {
        var descriptor = descriptors_1[_i];
        for (var _a = 0, _b = normalizeDescriptor(descriptor); _a < _b.length; _a++) {
            var normalized = _b[_a];
            expanded.add(normalized);
        }
    }
    return Array.from(expanded);
}
function computeIntentScore(userDescriptors, perfumeDescriptors) {
    var userExpanded = expandDescriptors(userDescriptors);
    var perfumeExpanded = expandDescriptors(perfumeDescriptors);
    var matchedClusters = 0;
    var totalClusters = Object.keys(intent_map_1.INTENT_CLUSTERS).length;
    for (var _i = 0, _a = Object.values(intent_map_1.INTENT_CLUSTERS); _i < _a.length; _i++) {
        var cluster = _a[_i];
        var userMatch = cluster.some(function (d) { return userExpanded.includes(d); });
        var perfumeMatch = cluster.some(function (d) { return perfumeExpanded.includes(d); });
        if (userMatch && perfumeMatch) {
            matchedClusters += 1;
        }
    }
    return matchedClusters / totalClusters;
}
