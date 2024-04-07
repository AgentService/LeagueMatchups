<template>
	<div class="app-wrapper">
		<div class="app-container">
			<div class="grid-container ">
				<div class="container-fluid">
					<div class="row align-items-start">
						<!-- <div class="col-xxl-2 col-xl-2 mt-4">
							<div class="card-fluid mb-4">
								<ChampionTips :champion="championA" />
							</div>
							<div class="card-fluid mt-4">
								Placeholder
							</div>
						</div> -->
						<div class="col-xxl-8 col-xl-8">
							<div class="row mb-4 mt-4">
								<div class="col-xxl-12 ">
									<div class="card-wide">
										<DailyNotes />
									</div>

								</div>

							</div>
							<div class="row">
								<div class="col-xxl-12">
									<!-- <div class="card-wide">
										<DailyNotes />
									</div> -->
								</div>
								<!-- <div class="col-xxl-9">
									<div class="card-large card-top card-bottom">
										 <MatchHistory /> 
									</div>
								</div> -->
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>



<script setup>
import { ref, watch, onMounted, computed, onUnmounted } from 'vue';
import { useStore } from 'vuex';

// Debug
import Debug from 'debug';

import DailyNotes from './components/DailyNotes.vue';


const debug = Debug('app:component:ChampionPage');


</script>

<style>
</style>