<template>
  <div class="container-fluid p-2 m-1">
    <div class="row">
      <div class="d-flex align-items-center">

        <div class="flex-grow-1 me-5">
          <div class="title-bar flex-grow-1 text-start">
            <span class="fw-bolder fs-5">Learning Objectives</span>
          </div>
        </div>
        <div class="flex-shrink-0">
          <div class="btn btn-default edit-button" href="path/to/settings" aria-label="Settings">
            <i class="fa fa-lg fa-cog" @click="toggleLOs(lo)" aria-hidden="true"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="lo-column">
      <!-- Edit Button -->

      <section v-for="category in categories" :key="category" class="lo-category-section">
        <div class="row">
          <div class="d-flex align-items-center">
            <div class="flex-grow-1 m-0 fs-5 mt-3">
              <p class="fw-bolder text-center mb-0">{{ category }}</p>
            </div>
          </div>
        </div>

        <div class="lo-cards-container">

          <div v-for="lo in categorizedObjectives[category]" :key="lo.name" class="lo-card">
            <div class="title-container">
              <div class="lo-title ms-1 mt-2 fs-6">
                <span class="fw-normal">{{ lo.name }}</span>
                <i v-if="lo.completed" class="fas fa-check-circle ms-1 text-success"></i>
              </div>
            </div>

            <div class="banner-progress-bar-container">
              <div class="banner-progress-bar" :class="{ 'is-complete': lo.completed }"
                :style="{ width: lo.progress + '%' }"></div>
            </div>
          </div>

        </div>
      </section>


    </div>

    <transition name="slide-down">
      <div class="lo-overlay" v-if="showLOs" @click="toggleLOs">
        <div class="lo-content" @click.stop>
          <!-- Form for setting/editing LOs -->
          <div v-for="(lo, index) in learningObjectives" :key="index" class="lo-edit-item">
            <input type="text" v-model="lo.name" />
            <input type="number" v-model="lo.weeks" min="1" placeholder="Weeks" />
            <button @click="removeLO(index)" class="btn-remove-lo">Remove</button>
          </div>
          <div class="new-lo-form">
            <input type="text" v-model="newLO.name" placeholder="New Learning Objective" />
            <select v-model="newLO.category">
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
            <input type="number" v-model="newLO.weeks" min="1" placeholder="Number of weeks" />
            <button @click="addNewLO">Add Objective</button>
            <p class="error-message">{{ errorMessage }}</p>

          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Debug from "debug";
const debug = Debug("app:component:LearingObjectives");
export default {
	data() {
		return {
			showLOs: false,
			maxLOs: 3,
			errorMessage: "", // To store and display error messages
			categories: ["In-Game", "Out-of-Game"],
			newLO: { name: "", weeks: 1, progress: 0, category: "In-Game" },
			learningObjectives: [
				{ name: "Skillshot Accuracy", startDate: new Date(), progress: 10, started: true, category: "In-Game", endDate: this.addWeeksToDate(new Date(), 4) },
				{ name: "Lasthitting", startDate: new Date(), progress: 55, started: true, category: "In-Game", endDate: this.addWeeksToDate(new Date(), 4) },
				{ name: "Wave Management", startDate: new Date(), progress: 55, started: true, category: "In-Game", endDate: this.addWeeksToDate(new Date(), 4) },
				{ name: "Thread Assesment", startDate: new Date(), progress: 55, started: true, category: "In-Game", endDate: this.addWeeksToDate(new Date(), 4) },
				{ name: "Roaming", startDate: new Date(), progress: 55, started: true, category: "In-Game", endDate: this.addWeeksToDate(new Date(), 4) },
				{ name: "Positioning", startDate: new Date(), progress: 55, started: true, category: "In-Game", endDate: this.addWeeksToDate(new Date(), 4) },
				{ name: "Map Awareness", startDate: new Date(), progress: 55, started: true, category: "In-Game", endDate: this.addWeeksToDate(new Date(), 4) },
				{ name: "Lane Assignments / Sidelaning", startDate: new Date(), progress: 55, started: true, category: "In-Game", endDate: this.addWeeksToDate(new Date(), 4) },

				{ name: "Teamfights", startDate: new Date(), completed: true, progress: 100, started: true, category: "Out-of-Game", endDate: this.addWeeksToDate(new Date(), 6) },
				{ name: "Teamfights", startDate: new Date(), completed: true, progress: 100, started: true, category: "Out-of-Game", endDate: this.addWeeksToDate(new Date(), 6) },
				{ name: "Teamfights", startDate: new Date(), completed: true, progress: 100, started: true, category: "Out-of-Game", endDate: this.addWeeksToDate(new Date(), 6) },


				// ... other placeholder LOs ...   
			]
		};
	},

	methods: {
		toggleLOs() {
			this.showLOs = !this.showLOs;
		},
		startLO(lo) {
			debug("startLO", lo);
			lo.started = true;
			lo.startDate = new Date(); // Set the start date to now
			lo.endDate = this.addWeeksToDate(lo.startDate, lo.weeks); // Set the endDate
			this.calculateProgress(lo); // Calculate initial progress
		},
		addNewLO() {
			debug("addNewLO", this.newLO);
			const categoryLOs = this.learningObjectives.filter(lo => lo.category === this.newLO.category);

			if (categoryLOs.length >= this.maxLOs) {
				this.errorMessage = `You can only add up to ${this.maxLOs} Learning Objectives per category. Focus on the ones you have!`;
			} else {
				this.errorMessage = "";
				if (this.newLO.name && this.newLO.weeks) {
					this.calculateProgress(this.newLO);
					const endDate = this.addWeeksToDate(new Date(), this.newLO.weeks);

					const newObjective = {
						name: this.newLO.name,
						weeks: this.newLO.weeks,
						progress: 0,
						started: true,
						startDate: new Date(),
						endDate: endDate, // Set the endDate property
						category: this.newLO.category,
					};
					debug("addNewLO", newObjective);
					this.learningObjectives.push(newObjective);
					// Sort after adding
					this.sortLOs();
					// Reset the form
					this.newLO = { name: "", weeks: 1, progress: 0, category: "In-Game", endDate: null };
					// Provide visual feedback
					this.provideFeedback("added");
				}
			}

		},
		addWeeksToDate(date, weeks) {
			return new Date(date.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
		},
		removeLO(index) {
			debug("removeLO", index);
			const removedLO = this.learningObjectives.splice(index, 1)[0];
			this.provideFeedback("remove", removedLO);
		},
		calculateProgress(lo) {
			if (!lo.started) return; // Skip calculation if the LO hasn't started

			const startDate = lo.startDate;
			const endDate = new Date(startDate.getTime() + lo.weeks * 7 * 24 * 60 * 60 * 1000);
			const now = new Date();
			const totalDuration = endDate - startDate;
			const timeElapsed = now - startDate;
			lo.progress = Math.min(100, (timeElapsed / totalDuration) * 100);
			lo.endDate = endDate; // Store the end date for sorting
			if (lo.progress >= 100) {
				lo.progress = 100;
				lo.completed = true; // Set the completed flag
				this.provideFeedback("add", this.newLO);
			}
		},
		provideFeedback(/*type, lo*/) {
			// Trigger an animation or emit an event
			// ... implementation depends on the type of feedback you want to provide ...
		},
		sortLOs() {
			if (!this.learningObjectives || !Array.isArray(this.learningObjectives)) {
				console.error("learningObjectives is undefined or not an array");
				return; // Stop the function if learningObjectives is not an array
			}

			// Perform the sorting only if learningObjectives is an array
			this.learningObjectives.sort((a, b) => {
				// Make sure both a.endDate and b.endDate are valid Date objects
				const aTime = a.endDate instanceof Date ? a.endDate.getTime() : 0;
				const bTime = b.endDate instanceof Date ? b.endDate.getTime() : 0;
				return aTime - bTime;
			});
		},
	},
	computed: {
		categorizedObjectives() {
			// This computed property organizes the LOs into categories
			const categorized = this.categories.reduce((acc, category) => {
				acc[category] = this.learningObjectives.filter(lo => lo.category === category);
				return acc;
			}, {});

			// Add any additional processing here if necessary
			return categorized;
		},
		sortedObjectives() {
			return this.learningObjectives
				.filter(lo => lo.started && lo.endDate) // Filter for LOs that have started and have an endDate
				.sort((a, b) => {
					// Safely access the getTime method only on defined endDate properties
					const aTime = a.endDate ? a.endDate.getTime() : 0;
					const bTime = b.endDate ? b.endDate.getTime() : 0;
					return aTime - bTime;
				});
		},
		// sortedObjectives() {
		// 	return this.learningObjectives
		// 		.filter(lo => lo.started)
		// 		.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
		// },
	},
	mounted() {
		this.learningObjectives.forEach((lo) => {
			this.calculateProgress(lo);
		});
	},
};
</script>

<style scoped>
/* ... existing styles ... */
.navbar {
  padding: 0px;
  background: var(--background-1-gradient);
}

.title-bar {
  text-align: center;
  color: var(--gold-3);
  border-bottom: 0px solid var(--gold-4);
}

.lo-card,
.lo-cards-container,
.lo-category-section {
  box-sizing: border-box;
  /* Include padding and border in the element's total width */
}

.lo-column {
  position: relative;
  max-height: 270px;
  width: 100%;
  box-sizing: border-box;
  flex-direction: column;
  padding: 0 1rem;
  display: flex;
  background: var(--background-1-gradient);
  color: white;
  overflow-x: hidden;
}

.lo-category-section {
  width: 100%;
  position: relative;
  background-color: #000406;
  /* Semi-transparent background */
  /* Padding for spacing */
  /* Margin for spacing */
}

/* Creating the left border */
.lo-category-section::before {
  content: "";
  position: absolute;
  left: 0;
  height: 90%;
  /* Set to 90% of the element’s height */
  width: 3px;
  /* Width of the border */
  /* background: linear-gradient(to top, #000000, #0D2029, #000000); */
  /* Gradient from black to base color and back to black */
  top: 5%;
  /* Centering the border vertically */
}



.lo-category-section h3 {
  font-size: 11px;
  z-index: 10;
  top: 9px;
  position: absolute;
  padding-left: 0.5rem;
  color: #ffffff;
  /* White text color */
  text-transform: uppercase;
  /* Making the text uppercase for a stylized appearance */
  letter-spacing: 1px;
  /* Adding a bit of space between the letters */
}

.lo-cards-container {
  flex-direction: column;
  /* Align LOs vertically */
  gap: 10px;
  /* Space between each LO */
  overflow-y: auto;
  /* Enable vertical scrolling */
  overflow-x: hidden;
  /* Hide horizontal scrollbar */
}

/* Style for each Learning Objective card */
.lo-card {
  min-width: 100%;
  /* Cards will take up the full width of the container */

  position: relative;
  background: var(--background-1-gradient);
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  /* Subtle shadow for depth */
  transition: transform 0.2s ease, box-shadow 0.2s ease;

}

.lo-card:hover {
  transform: translateY(-3px);
  /* Slight lift on hover */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
  /* Increased shadow on hover */
}

.title-container {
  display: flex;
  justify-content: start;
  align-items: center;
  width: 100%;
  /* Ensure it takes up the full width of the card */
}

/* Style for the title of the Learning Objective */
.lo-title {
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* Adjust based on your design preference */
}

/* Edit Button Styles */
.edit-button {
  position: relative;
  background-color: transparent;
  border: none;
  cursor: pointer;
  top: 0;
  /* Adjust the distance from the top as necessary */
  left: 0;
  /* Adjust the distance from the right as necessary */
  /* Additional styling for the button, like hover effects, can go here */
}

/* Error Message Styles */
.error-message {
  color: red;
  font-size: 0.9rem;
}

/* Styles for the progress bar container */
.banner-progress-bar-container {
  background: var(--border-grey-gradient);
  height: 4px;
  border-radius: 10px;
  margin: .5rem 1rem;
}

/* Styles for the progress bar itself */
.banner-progress-bar {
  background: var(--blue-laser-gradient);
  /* Green color for progress */
  height: 100%;
  /* Full height of the container */
  border-radius: 10px;
  /* Rounded corners */
}

/* 
.banner-progress-bar.is-complete {
  background-color: green !important;
  height: 100%;
  border-radius: 10px;
} */

/* Styles for the expand button */
.btn-expand-lo {
  background-color: #ffffff;
  /* White background */
  color: #003366;
  /* Dark blue text color to match the banner */
  border: none;
  /* Removing the border */
  border-radius: 5px;
  /* Rounded corners */
  cursor: pointer;
  /* Pointer cursor on hover */
}

.banner-progress-bar.is-complete {
  background-color: #28a745;
  /* Green color for completion */
}

.text-success {
  color: #28a745;
  /* Bootstrap's success color */
}

/* Styles for the overlay background to fill the screen */
.lo-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}


/* Styles for the content box inside the overlay */
.lo-content {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.btn-remove-lo {
  background-color: #ff4d4f;
  border: none;
  color: white;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  border-radius: 5px;
}

.new-lo-form {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
}

.new-lo-form input[type="number"] {
  width: auto;
  margin-bottom: 0.5rem;
}

/* Style for Webkit browsers like Chrome, Safari, etc. */
.lo-column::-webkit-scrollbar {
  height: 6px;
  /* Height of the scrollbar */
  width: 6px;
  /* Width of the scrollbar */
}

.lo-column::-webkit-scrollbar-thumb {
  background-color: #003366;
  /* Dark blue color for the thumb (scrolling part) */
  border-radius: 6px;
  /* Rounded corners for the thumb */
}

.lo-column::-webkit-scrollbar-track {
  background-color: #000000;
  /* Black color for the track (background part) */
}

/* Style for Firefox */
.lo-column {
  scrollbar-color: #005cb8 #000000;
  /* Dark blue thumb on a black track */
  scrollbar-width: thin
    /* Adjust the width to your preference */
}

/* Style for Firefox */
.lo-column {
  scrollbar-color: #005cb8 #000000;
  /* Dark blue thumb on a black track */
  scrollbar-width: thin;
  /* Adjust the width to your preference */
}
</style>
