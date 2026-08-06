export function normalizeGroups(fields, groups = {}) {
  return Object.entries(groups).map(([name, group]) => {
    const groupFields = group.fields ?? []

    for (const field of groupFields) {
      if (!fields[field]) {
        throw new Error(`vue-route-state: Unknown URL state group field: ${field}`)
      }
    }

    return {
      ...group,
      name,
      fields: groupFields,
      clearWhenDisabled: group.clearWhenDisabled ?? true,
    }
  })
}

export function groupsForField(groups, fieldName) {
  return groups.filter((group) => group.fields.includes(fieldName))
}

export function areGroupsEnabled(groups, context) {
  return groups.every((group) => isGroupEnabled(group, context))
}

export function isGroupEnabled(group, context) {
  if (typeof group.enabledWhen !== 'function') {
    return true
  }

  return Boolean(group.enabledWhen({ ...context, group: group.name }))
}

export function shouldClearDisabledField(groups, context) {
  return groups.some(
    (group) => !isGroupEnabled(group, context) && group.clearWhenDisabled,
  )
}
