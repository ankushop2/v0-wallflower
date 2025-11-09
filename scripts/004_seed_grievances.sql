-- Seed demo grievances for testing and development

-- Insert demo grievances with various categories and statuses
INSERT INTO grievances (
  title,
  description,
  category,
  impact,
  frequency,
  status,
  anonymous_token,
  upvotes,
  downvotes,
  created_at
) VALUES
  (
    'Broken AC in Building B - 3rd Floor',
    'The air conditioning on the 3rd floor of Building B has been broken for over 2 weeks. Temperature regularly exceeds 85°F making it very difficult to work. Multiple complaints have been filed but no action taken.',
    'facilities',
    'high',
    'daily',
    'open',
    'demo-token-001',
    42,
    3,
    NOW() - INTERVAL '3 days'
  ),
  (
    'Parking passes expire too quickly',
    'Visitor parking passes only last 4 hours. This is not enough time for contractors, consultants, or even family emergencies. Many other companies offer 8-12 hour passes.',
    'policy',
    'medium',
    'weekly',
    'open',
    'demo-token-002',
    28,
    5,
    NOW() - INTERVAL '5 days'
  ),
  (
    'Lack of standing desks in open office area',
    'The open office area has no standing desk options. This has led to back pain and discomfort for multiple employees. Research shows standing desks improve health and productivity.',
    'facilities',
    'medium',
    'daily',
    'in_progress',
    'demo-token-003',
    35,
    2,
    NOW() - INTERVAL '1 week'
  ),
  (
    'Conference rooms always booked - need more space',
    'All conference rooms are constantly booked 2-3 weeks in advance. Small teams have nowhere to meet privately. We need at least 3-4 more small meeting rooms.',
    'facilities',
    'high',
    'daily',
    'open',
    'demo-token-004',
    67,
    1,
    NOW() - INTERVAL '2 days'
  ),
  (
    'Cafeteria closes too early',
    'The cafeteria closes at 2pm but many employees work until 6pm or later. There are no nearby food options. Please extend hours to at least 5pm.',
    'benefits',
    'medium',
    'daily',
    'open',
    'demo-token-005',
    51,
    8,
    NOW() - INTERVAL '4 days'
  ),
  (
    'Slow Wi-Fi in common areas',
    'The Wi-Fi connection in the lounge and outdoor seating areas is extremely slow (< 5 Mbps). This makes it impossible to work remotely from these spaces.',
    'technology',
    'high',
    'daily',
    'in_progress',
    'demo-token-006',
    44,
    2,
    NOW() - INTERVAL '6 days'
  ),
  (
    'Need better bike storage and showers',
    'Current bike rack only fits 8 bikes and there is only 1 shower. Many employees want to bike to work but infrastructure is inadequate.',
    'facilities',
    'low',
    'weekly',
    'open',
    'demo-token-007',
    19,
    4,
    NOW() - INTERVAL '8 days'
  ),
  (
    'Inconsistent WFH policy enforcement across teams',
    'Some teams allow 3 days WFH while others mandate full time in-office. This feels unfair and arbitrary. We need consistent company-wide guidelines.',
    'policy',
    'high',
    'daily',
    'open',
    'demo-token-008',
    89,
    12,
    NOW() - INTERVAL '1 day'
  ),
  (
    'Printer on 2nd floor constantly jams',
    'The main printer near reception jams multiple times per day. Print jobs get lost and waste time. It needs to be replaced or serviced.',
    'technology',
    'low',
    'daily',
    'resolved',
    'demo-token-009',
    15,
    1,
    NOW() - INTERVAL '2 weeks'
  ),
  (
    'No lactation room available',
    'New mothers have no private space for pumping. The bathroom is not appropriate. OSHA requires employers to provide a private space.',
    'facilities',
    'high',
    'weekly',
    'in_progress',
    'demo-token-010',
    31,
    0,
    NOW() - INTERVAL '5 days'
  ),
  (
    'Kitchen cleaning schedule not being followed',
    'The kitchen is not being cleaned according to the posted schedule. Dishes pile up, trash overflows, and the fridge smells terrible.',
    'facilities',
    'medium',
    'daily',
    'open',
    'demo-token-011',
    23,
    3,
    NOW() - INTERVAL '3 days'
  ),
  (
    'Limited professional development budget',
    'The $500/year professional development budget has not increased in 5 years. Conference tickets alone often cost more than this.',
    'benefits',
    'medium',
    'yearly',
    'open',
    'demo-token-012',
    38,
    6,
    NOW() - INTERVAL '7 days'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert demo anonymous tokens
INSERT INTO anonymous_tokens (token, created_at)
VALUES
  ('demo-token-001', NOW() - INTERVAL '3 days'),
  ('demo-token-002', NOW() - INTERVAL '5 days'),
  ('demo-token-003', NOW() - INTERVAL '1 week'),
  ('demo-token-004', NOW() - INTERVAL '2 days'),
  ('demo-token-005', NOW() - INTERVAL '4 days'),
  ('demo-token-006', NOW() - INTERVAL '6 days'),
  ('demo-token-007', NOW() - INTERVAL '8 days'),
  ('demo-token-008', NOW() - INTERVAL '1 day'),
  ('demo-token-009', NOW() - INTERVAL '2 weeks'),
  ('demo-token-010', NOW() - INTERVAL '5 days'),
  ('demo-token-011', NOW() - INTERVAL '3 days'),
  ('demo-token-012', NOW() - INTERVAL '7 days')
ON CONFLICT (token) DO NOTHING;
