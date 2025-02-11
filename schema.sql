-- Actual implementation now in Supabase
CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    position VARCHAR(255),
    honors TEXT,
    is_notable BOOLEAN DEFAULT false,
    verification_token UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- Indices for performance
CREATE INDEX idx_signatures_status ON signatures(status);
CREATE INDEX idx_signatures_name ON signatures(name);
CREATE INDEX idx_signatures_email ON signatures(email);
CREATE INDEX idx_signatures_verification_token ON signatures(verification_token);

-- Add a constraint for valid status values
ALTER TABLE signatures
    ADD CONSTRAINT check_valid_status 
    CHECK (status IN ('pending', 'verified', 'rejected', 'revoked'));