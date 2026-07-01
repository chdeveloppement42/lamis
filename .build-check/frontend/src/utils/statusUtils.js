export const ACCOUNT_STATUS = {
  PENDING: 'PENDING',
  VALIDATED: 'VALIDATED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
};

export const LISTING_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
};

/**
 * Logic to determine if a listing is actually visible to the public.
 * (Safety Lock logic mirrored from backend)
 */
export const isListingVisible = (listing) => {
  if (!listing) return false;
  return (
    listing.status === LISTING_STATUS.PUBLISHED &&
    listing.provider?.status === ACCOUNT_STATUS.VALIDATED
  );
};

export const getStatusLabel = (status, type = 'listing') => {
  const maps = {
    listing: {
      DRAFT: 'Brouillon',
      PUBLISHED: 'Publié',
      UNPUBLISHED: 'Dépublié',
    },
    account: {
      PENDING: 'En attente',
      VALIDATED: 'Validé',
      REJECTED: 'Rejeté',
      SUSPENDED: 'Suspendu',
    },
  };
  return maps[type]?.[status] || status;
};

export const getStatusClass = (status) => {
  const classes = {
    DRAFT: 'admin-badge--warning',
    PUBLISHED: 'admin-badge--success',
    UNPUBLISHED: 'admin-badge--danger',
    PENDING: 'admin-badge--warning',
    VALIDATED: 'admin-badge--success',
    REJECTED: 'admin-badge--danger',
    SUSPENDED: 'admin-badge--danger',
  };
  return classes[status] || 'admin-badge--info';
};
