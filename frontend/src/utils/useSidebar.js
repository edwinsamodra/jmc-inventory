import { ref } from 'vue';

const isCollapsed = ref(false);

export function useSidebar() {
  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value;
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('sidebar-collapse', isCollapsed.value);
    }
  };

  const collapseSidebar = () => {
    isCollapsed.value = true;
    if (typeof document !== 'undefined') {
      document.body.classList.add('sidebar-collapse');
    }
  };

  const expandSidebar = () => {
    isCollapsed.value = false;
    if (typeof document !== 'undefined') {
      document.body.classList.remove('sidebar-collapse');
    }
  };

  return { isCollapsed, toggleSidebar, collapseSidebar, expandSidebar };
}
