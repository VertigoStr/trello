/**
 * Loading skeleton for board detail page.
 */

import React from 'react'
import { Card, Placeholder } from 'react-bootstrap'

export function BoardSkeleton() {
  return (
    <div className="d-flex gap-3 overflow-auto pb-3">
      {/* Skeleton column 1 */}
      <div style={{ minWidth: '300px', maxWidth: '300px' }}>
        <Card className="h-100">
          <Card.Header className="bg-white">
            <Placeholder as="p" animation="glow">
              <Placeholder xs={6} />
            </Placeholder>
          </Card.Header>
          <Card.Body className="p-2">
            <Placeholder as="p" animation="glow">
              <Placeholder xs={12} className="mb-2" />
              <Placeholder xs={12} className="mb-2" />
              <Placeholder xs={8} />
            </Placeholder>
          </Card.Body>
        </Card>
      </div>

      {/* Skeleton column 2 */}
      <div style={{ minWidth: '300px', maxWidth: '300px' }}>
        <Card className="h-100">
          <Card.Header className="bg-white">
            <Placeholder as="p" animation="glow">
              <Placeholder xs={6} />
            </Placeholder>
          </Card.Header>
          <Card.Body className="p-2">
            <Placeholder as="p" animation="glow">
              <Placeholder xs={12} className="mb-2" />
              <Placeholder xs={12} />
            </Placeholder>
          </Card.Body>
        </Card>
      </div>

      {/* Skeleton column 3 */}
      <div style={{ minWidth: '300px', maxWidth: '300px' }}>
        <Card className="h-100">
          <Card.Header className="bg-white">
            <Placeholder as="p" animation="glow">
              <Placeholder xs={6} />
            </Placeholder>
          </Card.Header>
          <Card.Body className="p-2">
            <Placeholder as="p" animation="glow">
              <Placeholder xs={12} className="mb-2" />
              <Placeholder xs={12} className="mb-2" />
              <Placeholder xs={12} className="mb-2" />
              <Placeholder xs={10} />
            </Placeholder>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}
