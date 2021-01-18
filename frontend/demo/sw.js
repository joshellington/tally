self.addEventListener('message', async (e) => {
  if (e.data.message === 'unload') {
    return await fetch(`${e.data.baseUrl}/${e.data.id}`, { method: 'delete' });
  }
});