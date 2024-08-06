<template>
    <div class="menu-bar">
        <div class="formatting-buttons">
            <button @click="editor?.chain().focus().toggleBold().run()"
                :class="{ 'is-active': editor?.isActive('bold') }">
                <i class="fas fa-bold"></i>
            </button>
            <button @click="editor?.chain().focus().toggleItalic().run()"
                :class="{ 'is-active': editor?.isActive('italic') }">
                <i class="fas fa-italic"></i>
            </button>
            <button @click="editor?.chain().focus().toggleUnderline().run()"
                :class="{ 'is-active': editor?.isActive('underline') }">
                <i class="fas fa-underline"></i>
            </button>
            <button @click="editor?.chain().focus().toggleBulletList().run()"
                :class="{ 'is-active': editor?.isActive('bulletList') }">
                <i class="fas fa-list-ul"></i>
            </button>
        </div>
        <div class="action-buttons">
            <button @click="editor?.chain().focus().undo().run()" class="menu-button">
                <i class="fas fa-undo"></i>
            </button>
            <button @click="editor?.chain().focus().redo().run()" class="menu-button">
                <i class="fas fa-redo"></i>
            </button>
        </div>
    </div>
</template>


<script setup>
import { defineProps } from 'vue';

// Define props
const props = defineProps({
    editor: Object,
});
</script>
<style scoped>
.menu-bar {
    margin-bottom: 10px;
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
}

.formatting-buttons {
    display: flex;
    gap: 5px;
}

.action-buttons {
    display: flex;
    gap: 5px;
    margin-left: auto;
}

.menu-bar button {
    padding: 5px 10px;
    border: none;
    background-color: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease;
}

.menu-bar button.is-active {
    color: #007bff;
}

.menu-bar button:hover {
    background-color: rgba(0, 123, 255, 0.1);
}

</style>
