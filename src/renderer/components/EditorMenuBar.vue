<template>
    <div class="flex justify-between items-center mb-0 mt-2 space-x-2 editor-menu" >
        <div class="flex space-x-2">
            <!-- Formatting Buttons -->
            <button @click="editor?.chain().focus().toggleBold().run()"
                :class="{ '': editor?.isActive('bold') }" class="p-2 transition">
                <i class="fas fa-bold"></i>
            </button>
            <button @click="editor?.chain().focus().toggleItalic().run()"
                :class="{ '': editor?.isActive('italic') }"
                class="p-2 transition">
                <i class="fas fa-italic"></i>
            </button>
            <button @click="editor?.chain().focus().toggleUnderline().run()"
                :class="{ '': editor?.isActive('underline') }"
                class="p-2 transition">
                <i class="fas fa-underline"></i>
            </button>
            <button @click="editor?.chain().focus().toggleBulletList().run()"
                :class="{ '': editor?.isActive('bulletList') }"
                class="p-2 transition">
                <i class="fas fa-list-ul"></i>
            </button>
        </div>
        <div class="flex space-x-2 ml-auto">
            <!-- Action Buttons -->
            <button @click="handleUndo" :disabled="!canUndo"
                class="p-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-undo"></i>
            </button>
            <button @click="handleRedo" :disabled="!canRedo"
                class="p-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-redo"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
    editor: Object,
});

const canUndo = computed(() => props.editor?.can().undo());
const canRedo = computed(() => props.editor?.can().redo());

function handleUndo() {
    if (canUndo.value) {
        const contentBeforeUndo = props.editor.getJSON();
        props.editor.chain().focus().undo().run();

        const contentAfterUndo = props.editor.getJSON();
        const isNowEmpty = contentAfterUndo.content?.length === 0;

        if (isNowEmpty) {
            const confirmClear = confirm("This action will clear the content. Are you sure you want to proceed?");
            if (!confirmClear) {
                props.editor.commands.setContent(contentBeforeUndo);
            }
        }
    }
}

function handleRedo() {
    if (canRedo.value) {
        props.editor.chain().focus().redo().run();
    }
}
</script>

<style scoped>
.editor-menu {
    margin-bottom: -1.2rem !important;
}
</style>