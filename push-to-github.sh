#!/bin/bash

# Script pour pousser le code sur GitHub
# Remplacez YOUR_USERNAME et YOUR_REPO_NAME par vos informations

GITHUB_USERNAME="YOUR_USERNAME"
REPO_NAME="YOUR_REPO_NAME"

echo "Ajout du remote GitHub..."
git remote add origin https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git

echo "Poussée du code sur GitHub..."
git branch -M main
git push -u origin main

echo "✅ Code poussé avec succès sur GitHub !"

