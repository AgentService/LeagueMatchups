// src/constants/feedbackQuestions.js

export const mainIssues = [
    { id: 'wave_management', label: 'Wave Management', iconClass: 'fas fa-water' },
    { id: 'vision_control', label: 'Vision Control', iconClass: 'fas fa-eye' },
    { id: 'map_awareness', label: 'Map Awareness', iconClass: 'fas fa-map-marked-alt' },
    { id: 'trading_laning_mechanics', label: 'Trading & Laning Mechanics', iconClass: 'fas fa-fist-raised' },
    { id: 'objective_control', label: 'Objective Control', iconClass: 'fas fa-trophy' },
    { id: 'decision_making', label: 'Decision Making', iconClass: 'fas fa-brain' },
    { id: 'teamfight_positioning', label: 'Positioning in Teamfights', iconClass: 'fas fa-users' },
    { id: 'mental_fortitude', label: 'Mental Fortitude', iconClass: 'fas fa-heartbeat' },
    { id: 'cs_management', label: 'CS Management', iconClass: 'fas fa-bullseye' },
];

// Sub-issues are mapped based on each main issue
export const subIssuesMap = {
    wave_management: [
        { id: 'overextending', label: 'Overextending', iconClass: 'fas fa-arrow-up' },
        { id: 'freezing_mistakes', label: 'Freezing Mistakes', iconClass: 'fas fa-snowflake' },
        { id: 'slow_push_mismanagement', label: 'Slow Push Mismanagement', iconClass: 'fas fa-hourglass-half' },
        { id: 'fast_pushing_errors', label: 'Fast Pushing Errors', iconClass: 'fas fa-rocket' },
    ],
    vision_control: [
        { id: 'no_early_wards', label: 'No Early Wards', iconClass: 'fas fa-eye-slash' },
        { id: 'control_ward_misuse', label: 'Control Ward Misuse', iconClass: 'fas fa-shield-alt' },
        { id: 'vision_denial_failures', label: 'Vision Denial Failures', iconClass: 'fas fa-ban' },
        { id: 'objective_vision_setup', label: 'Objective Vision Setup', iconClass: 'fas fa-binoculars' },
    ],
    map_awareness: [
        { id: 'jungler_tracking_failure', label: 'Jungler Tracking Failure', iconClass: 'fas fa-route' },
        { id: 'minimap_neglect', label: 'Minimap Neglect', iconClass: 'fas fa-map' },
        { id: 'roam_ignorance', label: 'Roam Ignorance', iconClass: 'fas fa-running' },
        { id: 'late_response_to_threats', label: 'Late Response to Threats', iconClass: 'fas fa-bell' },
    ],
    trading_laning_mechanics: [
        { id: 'bad_trades', label: 'Bad Trades', iconClass: 'fas fa-exchange-alt' },
        { id: 'cooldown_mismanagement', label: 'Cooldown Mismanagement', iconClass: 'fas fa-stopwatch' },
        { id: 'lane_positioning_errors', label: 'Lane Positioning Errors', iconClass: 'fas fa-arrows-alt' },
        { id: 'overcommitting', label: 'Overcommitting', iconClass: 'fas fa-exclamation-triangle' },
    ],
    objective_control: [
        { id: 'poor_dragon_baron_setup', label: 'Poor Dragon/Baron Setup', iconClass: 'fas fa-dragon' },
        { id: 'objective_timing_mistakes', label: 'Objective Timing Mistakes', iconClass: 'fas fa-clock' },
        { id: 'split_push_mismanagement', label: 'Split Push Mismanagement', iconClass: 'fas fa-arrows-alt-h' },
        { id: 'overcommitment_to_objectives', label: 'Overcommitment to Objectives', iconClass: 'fas fa-exclamation' },
    ],
    decision_making: [
        { id: 'overstaying', label: 'Overstaying', iconClass: 'fas fa-hourglass-end' },
        { id: 'bad_roaming_decisions', label: 'Bad Roaming Decisions', iconClass: 'fas fa-road' },
        { id: 'misjudging_enemy_strength', label: 'Misjudging Enemy Strength', iconClass: 'fas fa-balance-scale' },
        { id: 'ignoring_win_conditions', label: 'Ignoring Win Conditions', iconClass: 'fas fa-trophy' },
    ],
    teamfight_positioning: [
        { id: 'carry_positioning', label: 'Carry Positioning', iconClass: 'fas fa-crosshairs' },
        { id: 'tank_engage_mistiming', label: 'Tank/Engage Mistiming', iconClass: 'fas fa-shield-alt' },
        { id: 'peeling_failures', label: 'Peeling Failures', iconClass: 'fas fa-user-shield' },
        { id: 'engage_timing', label: 'Engage Timing', iconClass: 'fas fa-bullhorn' },
    ],
    mental_fortitude: [
        { id: 'tilt_management', label: 'Tilt Management', iconClass: 'fas fa-angry' },
        { id: 'poor_adaptability', label: 'Poor Adaptability', iconClass: 'fas fa-sync' },
        { id: 'frustration_induced_errors', label: 'Frustration-Induced Errors', iconClass: 'fas fa-bolt' },
        { id: 'overconfidence', label: 'Overconfidence', iconClass: 'fas fa-grin-stars' },
    ],
    cs_management: [
        { id: 'missing_cs', label: 'Missing CS', iconClass: 'fas fa-times-circle' },
        { id: 'cs_under_tower', label: 'Struggling CS Under Tower', iconClass: 'fas fa-tower-broadcast' },
        { id: 'harassment_while_farming', label: 'Harassment While Farming', iconClass: 'fas fa-fist-raised' },
        { id: 'freezing_for_farm', label: 'Freezing for CS', iconClass: 'fas fa-icicles' },
        { id: 'poor_wave_clear', label: 'Poor Wave Clear', iconClass: 'fas fa-water' },
    ],
};
