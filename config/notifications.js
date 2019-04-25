const notifications = {
  newCompany ( data ) {
    return {
      title: 'New Team is available',
      body: `${data.company.name} is available for You now`,
      sound: data.sound || 'default',
      badge: data.badge || 1,
      tag: 'newCompany'
    }
  }
};

export { notifications };
