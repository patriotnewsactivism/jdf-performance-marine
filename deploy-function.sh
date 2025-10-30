#!/bin/bash

# Deploy Supabase Edge Function Script
# This script helps deploy the marine-chat edge function to Supabase

set -e

echo "================================================"
echo "  Supabase Edge Function Deployment Helper"
echo "================================================"
echo ""

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm install -g supabase
fi

# Project reference
PROJECT_REF="yqhfuupiffhejocltowt"

echo "This script will help you deploy the marine-chat edge function."
echo ""
echo "Prerequisites:"
echo "1. You need a Supabase access token"
echo "2. You need either an OpenAI API key OR a Google Gemini API key"
echo ""

# Check if access token is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ SUPABASE_ACCESS_TOKEN is not set"
    echo ""
    echo "To get an access token:"
    echo "1. Go to https://supabase.com/dashboard/account/tokens"
    echo "2. Create a new access token"
    echo "3. Run: export SUPABASE_ACCESS_TOKEN='your_token_here'"
    echo ""
    echo "Or run: npx supabase login"
    echo ""
    exit 1
fi

echo "✅ Access token found"
echo ""

# Link the project
echo "Linking to Supabase project..."
npx supabase link --project-ref $PROJECT_REF

echo ""
echo "Now, let's set up your API keys."
echo ""
echo "Which AI provider do you want to use?"
echo "1) OpenAI (GPT-4o-mini) - Recommended"
echo "2) Google Gemini (1.5-flash)"
read -p "Enter your choice (1 or 2): " provider_choice

if [ "$provider_choice" = "1" ]; then
    echo ""
    echo "Enter your OpenAI API key:"
    echo "(Get one from: https://platform.openai.com/api-keys)"
    read -s -p "OpenAI API Key: " openai_key
    echo ""
    
    if [ -n "$openai_key" ]; then
        echo "Setting OpenAI API key..."
        echo "$openai_key" | npx supabase secrets set OPENAI_API_KEY
        echo "✅ OpenAI API key configured"
    else
        echo "❌ No API key provided"
        exit 1
    fi
elif [ "$provider_choice" = "2" ]; then
    echo ""
    echo "Enter your Google Gemini API key:"
    echo "(Get one from: https://aistudio.google.com/apikey)"
    read -s -p "Gemini API Key: " gemini_key
    echo ""
    
    if [ -n "$gemini_key" ]; then
        echo "Setting Gemini API key..."
        echo "$gemini_key" | npx supabase secrets set GEMINI_API_KEY
        echo "✅ Gemini API key configured"
    else
        echo "❌ No API key provided"
        exit 1
    fi
else
    echo "❌ Invalid choice"
    exit 1
fi

echo ""
echo "Deploying the marine-chat edge function..."
npx supabase functions deploy marine-chat

echo ""
echo "================================================"
echo "  ✅ Deployment Complete!"
echo "================================================"
echo ""
echo "The marine-chat edge function has been deployed successfully."
echo ""
echo "Next steps:"
echo "1. Test the chatbot on your website"
echo "2. Check the logs: https://supabase.com/dashboard/project/$PROJECT_REF/functions/marine-chat/logs"
echo "3. If you encounter issues, check the function logs for detailed error messages"
echo ""
