/** Nybble 0 — authorizes registering and reserving new names. Root only. */
const ROLE_REGISTRAR = 1n << 0n
const ROLE_REGISTRAR_ADMIN = ROLE_REGISTRAR << 128n

/** Nybble 1 — authorizes registering a reserved name. Root only. */
const ROLE_REGISTER_RESERVED = 1n << 4n
const ROLE_REGISTER_RESERVED_ADMIN = ROLE_REGISTER_RESERVED << 128n

/** Nybble 2 — authorizes setting the parent registry. Root only. */
const ROLE_SET_PARENT = 1n << 8n
const ROLE_SET_PARENT_ADMIN = ROLE_SET_PARENT << 128n

/** Nybble 3 — authorizes unregistering names. Root or token. */
const ROLE_UNREGISTER = 1n << 12n
const ROLE_UNREGISTER_ADMIN = ROLE_UNREGISTER << 128n

/** Nybble 4 — authorizes extending name expiry. Root or token. */
const ROLE_RENEW = 1n << 16n
const ROLE_RENEW_ADMIN = ROLE_RENEW << 128n

/** Nybble 5 — authorizes changing a name's child registry. Root or token. */
const ROLE_SET_SUBREGISTRY = 1n << 20n
const ROLE_SET_SUBREGISTRY_ADMIN = ROLE_SET_SUBREGISTRY << 128n

/** Nybble 6 — authorizes changing a name's resolver. Root or token. */
const ROLE_SET_RESOLVER = 1n << 24n
const ROLE_SET_RESOLVER_ADMIN = ROLE_SET_RESOLVER << 128n

/** Nybble 7 — authorizes ERC1155 token transfers. Admin-only (checked on token owner). */
const ROLE_CAN_TRANSFER_ADMIN = (1n << 28n) << 128n

/** Nybble 31 — authorizes UUPS proxy upgrades. Root only. */
const ROLE_UPGRADE = 1n << 124n
const ROLE_UPGRADE_ADMIN = ROLE_UPGRADE << 128n

export {
  ROLE_CAN_TRANSFER_ADMIN,
  ROLE_REGISTER_RESERVED,
  ROLE_REGISTER_RESERVED_ADMIN,
  ROLE_REGISTRAR,
  ROLE_REGISTRAR_ADMIN,
  ROLE_RENEW,
  ROLE_RENEW_ADMIN,
  ROLE_SET_PARENT,
  ROLE_SET_PARENT_ADMIN,
  ROLE_SET_RESOLVER,
  ROLE_SET_RESOLVER_ADMIN,
  ROLE_SET_SUBREGISTRY,
  ROLE_SET_SUBREGISTRY_ADMIN,
  ROLE_UNREGISTER,
  ROLE_UNREGISTER_ADMIN,
  ROLE_UPGRADE,
  ROLE_UPGRADE_ADMIN,
}
