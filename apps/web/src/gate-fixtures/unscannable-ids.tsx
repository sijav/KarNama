import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'

// Every way of writing a message id that the catalog test cannot read, KN-111.
// Each would put an id in the code that never reaches the catalog, so a Persian
// reader would silently get the English. The lint must reject every one of them.
// See README.md in this directory.
const ID = 'Delete this application'
export const BracedTrans = () => <Trans id={'Delete this application'} />
export const TemplateTrans = () => <Trans id={`Delete this application`} />
export const NamedTrans = () => <Trans id={ID} />
export const IdNotFirst = () => <Trans values={{}} id="Delete this application" />
export const templateCall = () => i18n._(`Delete this application`)
export const namedCall = () => i18n._(ID)
