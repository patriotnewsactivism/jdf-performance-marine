<#
.SYNOPSIS
    Builds the Vite frontend and deploys the Supabase edge function and secrets for the J.D.F. Performance Marine project.

.DESCRIPTION
    This script automates the following deployment steps:
    1. Installs all required NPM dependencies.
    2. Runs the production build for the Vite frontend (output to /dist).
    3. Prompts for interactive Supabase login.
    4. Links the Supabase project using the Project ID from your files.
    5. Deploys the 'marine-chat' edge function.
    6. Securely prompts for the 'OPENAI_API_KEY' and sets it as a Supabase secret.
    7. Verifies the local '.env' file is ready for the build.

.NOTES
    - Requires Node.js, npm, and the Supabase CLI to be installed and available in your system's PATH.
    - Run this script from the root of your project directory.
#>

# --- Configuration ---
$ProjectRef = "pqicjnzddgtojxubftgw"  #
$FunctionName = "marine-chat"       #
$SecretName = "OPENAI_API_KEY"      #
$EnvFile = ".env"                   #
$EnvExampleFile = ".env.example"    #

# --- Helper Function for Steps ---
function Write-Step {
    param (
        [string]$Message
    )
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "================================================="
}

try {
    # --- Step 1: Verify Frontend Environment ---
    Write-Step "STEP 1: Verifying frontend '.env' file..."
    if (-not (Test-Path $EnvFile)) {
        Write-Host "'.env' file not found. Please create it from '$EnvExampleFile' and add your VITE_SUPABASE_PUBLISHABLE_KEY before running this script." -ForegroundColor Yellow
        throw "'.env' file is missing."
    }
    
    $envContent = Get-Content $EnvFile
    if ($envContent -match "your_supabase_anon_key_here") {
        Write-Host "WARNING: Your '.env' file still contains the placeholder key from '.env.example'." -ForegroundColor Yellow
        Write-Host "Please update 'VITE_SUPABASE_PUBLISHABLE_KEY' in your '.env' file." -ForegroundColor Yellow
        throw "VITE_SUPABASE_PUBLISHABLE_KEY is not set."
    }
    Write-Host "Frontend '.env' file is present." -ForegroundColor Green

    # --- Step 2: Install NPM Dependencies ---
    Write-Step "STEP 2: Installing NPM dependencies..."
    npm install | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "NPM install failed."
    }
    Write-Host "NPM dependencies installed successfully." -ForegroundColor Green

    # --- Step 3: Build Vite Frontend ---
    Write-Step "STEP 3: Building Vite frontend (npm run build)..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Vite build (npm run build) failed."
    }
    Write-Host "Vite frontend built successfully. Static files are in /dist." -ForegroundColor Green

    # --- Step 4: Supabase Login ---
    Write-Step "STEP 4: Logging in to Supabase CLI..."
    Write-Host "A browser window will open for you to log in to Supabase."
    supabase login
    if ($LASTEXITCODE -ne 0) {
        throw "Supabase login failed or was cancelled."
    }
    Write-Host "Supabase login successful." -ForegroundColor Green

    # --- Step 5: Link Supabase Project ---
    Write-Step "STEP 5: Linking Supabase project '$ProjectRef'..."
    supabase link --project-ref $ProjectRef
    if ($LASTEXITCODE -ne 0) {
        throw "Supabase project linking failed."
    }
    Write-Host "Project linked successfully." -ForegroundColor Green

    # --- Step 6: Deploy Edge Function ---
    Write-Step "STEP 6: Deploying Edge Function '$FunctionName'..."
    supabase functions deploy $FunctionName --project-ref $ProjectRef
    if ($LASTEXITCODE -ne 0) {
        throw "Edge function deployment failed."
    }
    Write-Host "Edge function '$FunctionName' deployed successfully." -ForegroundColor Green

    # --- Step 7: Set Edge Function Secrets ---
    Write-Step "STEP 7: Setting Edge Function Secret ($SecretName)..."
    $ApiKey = Read-Host -Prompt "Please enter your $SecretName (it will not be displayed or saved)" -AsSecureString
    
    if ($null -eq $ApiKey -or $ApiKey.Length -eq 0) {
        throw "API Key cannot be empty. Secret not set."
    }
    
    Write-Host "Setting $SecretName secret for the '$FunctionName' function..."
    
    # Convert SecureString to plain text for the CLI command
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($ApiKey)
    $ApiKeyPlainText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    try {
        # Use stdin to pass the secret securely
        $ApiKeyPlainText | supabase secrets set $SecretName --project-ref $ProjectRef
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to set Supabase secret."
        }
        Write-Host "Supabase secret '$SecretName' set successfully." -ForegroundColor Green
    }
    finally {
        # Securely clear the plain text key from memory
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
        Remove-Variable ApiKeyPlainText -ErrorAction SilentlyContinue
    }

    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host "DEPLOYMENT SCRIPT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "Your frontend is built and ready in the /dist folder."
    Write-Host "Your Supabase function and secrets are deployed and live."
    Write-Host "================================================="

} catch {
    Write-Host "=================================================" -ForegroundColor Red
    Write-Host "AN ERROR OCCURRED:" -ForegroundColor Red
    Write-Host $_ -ForegroundColor Red
    Write-Host "================================================="
}
