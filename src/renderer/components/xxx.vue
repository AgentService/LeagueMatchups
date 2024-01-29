<template>
	<div class="card">
		<ul class="nav nav-tabs nav-fill" id="myTabs" role="tablist">
			<!-- Loop through identities and create a tab for each -->
			<li class="nav-item" v-for="(identity, index) in identities.list" :key="identity.id">
				<a class="nav-link" :id="'identity-tab-' + identity.id" data-toggle="tab" :href="'#identity-' + identity.id"
					role="tab">
					{{ identity.name }}
				</a>
				<button class="btn btn-sm btn-danger" @click="deleteIdentity(index)">
					Remove Identity
				</button>
			</li>

			<!-- Tab to add a new identity -->
			<li class="nav-item">
				<a class="nav-link" id="add-identity-tab" data-toggle="tab" href="#add-identity" role="tab">
					+ Add Identity
				</a>
			</li>
		</ul>

		<div class="tab-content">
			<!-- Loop through identities and create content for each -->
			<div class="tab-pane fade" :id="'identity-' + identity.id" v-for="(identity, index) in identities.list"
				:key="identity.id" role="tabpanel">
				<p>{{ identity.description }}</p>
			</div>

			<!-- Tab content for adding a new identity -->
			<div class="tab-pane fade" id="add-identity" role="tabpanel">
				<form @submit.prevent="addIdentity(newIdentity)">
					<div class="form-group">
						<label for="new-identity-name">Identity Name</label>
						<input type="text" class="form-control" id="new-identity-name" v-model="newIdentity.name">
					</div>
					<div class="form-group">
						<label for="new-identity-description">Description</label>
						<textarea class="form-control" id="new-identity-description" v-model="newIdentity.description"
							rows="3"></textarea>
					</div>
					<button type="submit" class="btn btn-primary">Add Identity</button>
				</form>
			</div>
		</div>
	</div>
</template>
  
<script setup>
import { ref, reactive, onMounted } from 'vue'; // Import onMounted for component lifecycle hook
import { useStore } from 'vuex';

// Mock data for demonstration purposes
const store = useStore();
const championId = ref(''); // Replace with actual champion ID
const newIdentity = reactive({ name: '', description: '' });

const identities = reactive({
	list: [
		{ id: 'scaling', name: 'Scaling Syndra', description: 'Strong in mid to late game, weak early.' },
		{ id: 'early', name: 'Early Game Syndra', description: 'Strong early, weaker than scaling in the mid to late game.' },
		// ... other identities
	],
	current: null
});

function addIdentity(identity) {
	identities.list.push({ ...identity, id: Date.now().toString() });
	newIdentity.name = '';
	newIdentity.description = '';
	// Persist the new identity list to the store or backend
}

function deleteIdentity(index) {
	identities.list.splice(index, 1);
	// Update the store or backend to reflect this change
}

// Replace onMounted with actual fetching logic
onMounted(() => {
	// Fetch initial identities for the given champion and set up the reactive state
});
</script>
