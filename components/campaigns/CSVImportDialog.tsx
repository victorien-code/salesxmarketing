'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download,
  X,
  User,
  AtSign,
  Info
} from 'lucide-react';

interface CSVAccount {
  account: string;
  firstName?: string;
  lastName?: string;
  [key: string]: string | undefined;
}

interface CSVImportDialogProps {
  onImport: (accounts: CSVAccount[]) => void;
  trigger?: React.ReactNode;
}

export default function CSVImportDialog({ onImport, trigger }: CSVImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [csvData, setCsvData] = useState<CSVAccount[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Veuillez sélectionner un fichier CSV valide');
      return;
    }

    setIsLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const parsedData = parseCSV(csv);
        setCsvData(parsedData);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors du traitement du fichier';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Erreur lors de la lecture du fichier');
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const parseCSV = (csvText: string): CSVAccount[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) {
      throw new Error('Le fichier CSV est vide');
    }

    // Détecter si la première ligne contient des en-têtes
    const firstLine = lines[0].toLowerCase();
    const hasHeaders = firstLine.includes('account') || firstLine.includes('username') || firstLine.includes('nom');
    
    const dataLines = hasHeaders ? lines.slice(1) : lines;
    let headers: string[] = [];

    if (hasHeaders) {
      headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    }

    const accounts: CSVAccount[] = [];
    const errors: string[] = [];

    dataLines.forEach((line, index) => {
      const lineNumber = hasHeaders ? index + 2 : index + 1;
      
      if (!line.trim()) return; // Ignorer les lignes vides

      const values = line.split(',').map(v => v.trim());
      
      if (values.length === 0) return;

      let account: CSVAccount;

      if (hasHeaders && headers.length > 0) {
        // Utiliser les en-têtes pour mapper les colonnes
        account = { account: '' };
        
        headers.forEach((header, i) => {
          const value = values[i] || '';
          
          if (header.includes('account') || header.includes('username') || header.includes('instagram')) {
            account.account = value.replace('@', '');
          } else if (header.includes('prenom') || header.includes('first') || header.includes('firstname')) {
            account.firstName = value;
          } else if (header.includes('nom') || header.includes('last') || header.includes('lastname') || header.includes('family')) {
            account.lastName = value;
          } else {
            // Conserver tous les autres champs avec leur nom original
            account[header] = value;
          }
        });
      } else {
        // Format simple : première colonne = account, deuxième = prénom, troisième = nom
        account = {
          account: values[0]?.replace('@', '') || '',
          firstName: values[1] || undefined,
          lastName: values[2] || undefined
        };
      }

      // Validation : le champ account est obligatoire
      if (!account.account) {
        errors.push(`Ligne ${lineNumber}: Le nom de compte est obligatoire`);
        return;
      }

      // Validation du format du nom de compte
      if (!/^[a-zA-Z0-9._]+$/.test(account.account)) {
        errors.push(`Ligne ${lineNumber}: Format de compte invalide "${account.account}"`);
        return;
      }

      accounts.push(account);
    });

    if (errors.length > 0) {
      throw new Error(`Erreurs dans le fichier CSV:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... et ${errors.length - 5} autres erreurs` : ''}`);
    }

    if (accounts.length === 0) {
      throw new Error('Aucun compte valide trouvé dans le fichier CSV');
    }

    return accounts;
  };

  const handleImport = () => {
    if (csvData.length > 0) {
      onImport(csvData);
      setIsOpen(false);
      setCsvData([]);
      setError('');
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'account,firstName,lastName,age,location\nmarie_fitness,Marie,Dubois,25,Paris\njohn_coach,John,Smith,30,London\nfitness_guru,,,28,New York\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_comptes_instagram.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const removeAccount = (index: number) => {
    setCsvData(csvData.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
    fileInput?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importer CSV
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Importer une liste de comptes Instagram
          </DialogTitle>
          <DialogDescription>
            Importez vos comptes depuis un fichier CSV. Seul le champ "account" est obligatoire.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format du fichier */}
          <div className="space-y-4">
            <h4 className="font-medium">Format du fichier CSV</h4>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Champ obligatoire :</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>account</strong> : nom d'utilisateur Instagram sans @ (obligatoire)</li>
                  </ul>
                  <p><strong>Champs optionnels :</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>firstName</strong> : prénom de l'utilisateur</li>
                    <li><strong>lastName</strong> : nom de famille de l'utilisateur</li>
                    <li><strong>Tout autre champ personnalisé</strong> : age, location, etc.</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">
                    Tous les champs seront disponibles pour personnaliser vos messages avec la syntaxe {`{nom_du_champ}`}
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger le template
              </Button>
            </div>
          </div>

          {/* Upload */}
          <div className="space-y-4">
            <h4 className="font-medium">Sélectionner votre fichier</h4>
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    onClick={triggerFileInput}
                    disabled={isLoading}
                    className="mb-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isLoading ? 'Traitement...' : 'Choisir un fichier CSV'}
                  </Button>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Fichiers CSV uniquement (max 10MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Erreurs */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
            </Alert>
          )}

          {/* Aperçu des données */}
          {csvData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Aperçu des comptes importés</h4>
                <Badge variant="secondary">
                  {csvData.length} compte{csvData.length > 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Afficher les champs détectés */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Champs détectés :</Label>
                <div className="flex flex-wrap gap-2">
                  {csvData.length > 0 && Object.keys(csvData[0]).map((field) => (
                    <Badge key={field} variant="outline" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ces champs seront disponibles pour personnaliser vos messages
                </p>
              </div>

              <div className="max-h-60 overflow-y-auto border rounded-lg">
                <div className="grid grid-cols-1 gap-2 p-4">
                  {csvData.slice(0, 50).map((account, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-3">
                        <AtSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">@{account.account}</div>
                          {(account.firstName || account.lastName) && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {account.firstName} {account.lastName}
                            </div>
                          )}
                          {/* Afficher les autres champs */}
                          {Object.entries(account).map(([key, value]) => {
                            if (key !== 'account' && key !== 'firstName' && key !== 'lastName' && value) {
                              return (
                                <div key={key} className="text-xs text-muted-foreground">
                                  {key}: {value}
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAccount(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {csvData.length > 50 && (
                    <div className="text-center text-sm text-muted-foreground py-2">
                      ... et {csvData.length - 50} autres comptes
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={csvData.length === 0 || isLoading}
            >
              {isLoading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Importer {csvData.length} compte{csvData.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}