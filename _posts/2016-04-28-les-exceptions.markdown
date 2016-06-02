---
layout: post
url: "/common/2016/04/28/les-exceptions.html"
title:  "Les exceptions"
author: "Anouar Kahla"
date:   2016-04-28 16:35:00 +0100
pitch:  "L'objectif de cet article est de voir comment gérer convenablement les exception"
comments: True
categories: common
---

Le traitement des exceptions avec les blocs try catch a été introduit dans PHP5.
Une exception peut être lancée depuis n'importe où dans le code en lançant une instance de la classe Exception avec comme arguments le message et le code d’erreur:

    <?php
    $e = new Exception('Une erreur s'est produite');
    // Afficher le message Une erreur s'est produite'
    echo $e->getMessage();
    // lancement d'une exception
    throw $e;
    // Cette ligne ne sera jamais exécutée
    $this->logger->err("Error during Eurotax valuation");

## Classes d'exceptions personnalisées

Les exceptions personnalisées permettent d'identifier clairement les types d'erreurs générées dans le but de les traiter spécifiquement et efficacement.

    <?php
    // declaration
    class Aramis_Eurotax_Exception extends Exception
    {
    }
    
    try {
        throw new Aramis_Eurotax_Exception(sprintf("Error during Eurotax valuation");
    } catch (InvalidArgumentException $e) {
        $this->logger->addError('exception '.$e->getMessage());
    } catch (\Exception $e) {
        $isOk = false;
        $this->logger->addError('erreur dans le traitement '.$e->getMessage());
    }

On peut mettre plusieurs blocs catch comme c’est le cas dans ce code:

    <?php
    try {
    ...
    } catch (Aramis_Eurotax_Exception $e) {
    ...
    } catch (EurotaxException $e) {
    ...
    } catch (VehicleNotMergedException $e) {
    ...
    } catch (InvalidVehicleEnergy $e) {
    ...
    } catch (ValuationException $e) {
    ...
    }

## Mécanisme d'interception automatique des exceptions


PHP dispose d'un mécanisme qui permet de capturer automatiquement toutes les exceptions qui sont lancées mais qui ne sont pas entourées de blocs try {} catch() {}.

L'exception handler, lorsqu'il intercepte une exception, interrompt complètement l'exécution du programme et appelle une fonction personnalisée de callback qui se chargera du traitement adéquat de ces exceptions perdues.

Exemple:

    <?php
    function processIntraitedException(Exception $e) {
        
        error_log('Une exception : '.$e->getMessage());
        exit;
    }
       /**
       * Enregistrement de la fonction de rappel dans l'exception handler de PHP
       */
       set_exception_handler('processIntraitedException');

Dans symfony avec FOSRestBundle on peut personnaliser les messages d'erreur en spécifiant la configuration du bundle FOSRestBundle nos propres class et messages :

    <?php
    fos_rest:
        exception:
            codes:
                'Aramis\Objects\Exception\NotFoundException': 404
                'Aramis\Objects\Exception\ExternalValidationException': 400
                'Aramis\Objects\Exception\PreConditionFailedException': 412
                'InvalidArgumentException': 400
            messages:
                'Aramis\Objects\Exception\NotFoundException': true
                'Aramis\Objects\Exception\ExternalValidationException': true
                'Aramis\Objects\Exception\PreConditionFailedException': true
                'InvalidArgumentException': true

## Les bonnes pratiques
* Ne jamais ignorer une exception

Une erreur fréquente est de mettre un bloc catch vide sans aucune instruction afin de ne pas bloquer le processus. Ceci est très dangereux car cela risque de devenir une mauvaise habitude et si une exception survient, elle sera ignoré et le code continuera à s'exécuter ce qui peut déboucher sur des bugs incompréhensibles. Il faut avoir le réflexe de bien traiter les exceptions dans les blocs catch ou au moins de mettre un error_log.

* Les exceptions ne sont pas faites pour le contrôle des boucles

C'est une très mauvaise idée d'utiliser les exceptions pour contrôler les boucles. 
Dans ce code on se sert de la levée d'une exception pour sortir de la boucle:

    <?php
    while (true) {
        //faire quelque chose
        if(condition d'arrêt) {
            throw new FinDeBoucleException();
        }
    }

Inconvénients : pas efficace ( création d'un objet supplémentaire à savoir l'exception ), difficilement compréhensible et modifiable. Il y a suffisamment d'instructions de contrôle pour éviter ce genre de code, (instruction break par exemple).

* Encapsulation des Exceptions

L'exception qui apparaît n'est pas forcément celle qui est à l'origine de l'erreur, dans cet exemple c'est la deuxième exception qui est renvoyée.

    <?php
    try {
        throw new Exception("Erreur 1");
    } catch (Exception $e) {
        throw new Exception("Erreur 2");
    }

La solution est de passer l’exception d’origine comme 3ème argument à la nouvelle exception (voir [documentation](http://php.net/manual/en/language.exceptions.extending.php)).

    <?php
    try {  
        maMethodeQuiRenvoitPlusieursTypesDException(); 
    } catch (Exception $e) {
        // En englobe toutes les exceptions dans une exception unique  
        throw new Exception("Un problème est survenue", 0, $e); 
    }

* Traiter les requêtes cUrl qui prennent un temps énorme:

Si la réponse de l’appel cUrl contient la phrase “cURL error 28” on crée une exception avec message indiquant l’expiration et avec 2ème argument le code ‘408’.

    <?php
    try {
        $response = $this->httpClient->send($request);
    } catch (GuzzleHttp\Exception\RequestException $e) {
        if ($e->hasResponse()) {
            $response = $e->getResponse();
        } else {
            if (strpos($e->getMessage(), 'cURL error 28') !== false) {
                throw new Exception(sprintf("Request timed out after %s sec",$timeout), 408);
            }
            throw new Exception("External call failed: $request");
        }
    }

De cette façon on peut récupérer le code et le message convenablement dans le try catch qui contient l’appel à la methode ci-dessus.

    ```
    <?php
    try {
        ...
        $responseBody = $this->_restClient->$method($uri, $data, $params);
        ...
    } catch (Aramis_Service_Salesforce_Exception $e) {
        ...
    } catch (Exception $e) {
        if ($e->getCode() == 408) {
            error_log('La requette vers Salesforce a expiré : '.$e->getMessage());
        }
        throw new Aramis_Service_Salesforce_Exception($e->getMessage());
    }

* Éviter l’affichage des messages d’erreur technique au utilisateurs normaux

Lorsque il y’a utilisation d'un webservice et que cet appel ne doit pas être bloquant on peut le mettre dans un bloc try catch et on trace l’erreur dans les log si l'appel à échoué:

    <?php
    try {
        $valuationHandler = new ValuationHandler();
        $valuation        = $valuationHandler->retrieveValuation($tradeInVehicle);
        $tradeInVehicle->setTradeInPrice($valuation['buyingPrice']);
    } catch (Exception $e) {
        $this->getLogger()->log('The API WS call to refresh trade_in_price failed ');
        $this->getUser()->setFlash('error', 'Impossible d\'actualiser le prix en ligne.');
    }

* Ne pas arréter l’execution d’un consommateur de file rabbitmq:

    <?php
    public function execute(AMQPMessage $msg)
    {
        try {
            $decodedMsg = json_decode($msg->body, true);
            $this->tradeInAppPushService->sendNotification($decodedMsg);
        } catch(\Exception $e) {
            error_log("Erreur lors de l'envoie de push vers l'application mobile");
        }
    }

## Références:
[php.net](http://php.net).

[Exception controller support](http://symfony.com/doc/current/bundles/FOSRestBundle/4-exception-controller-support.html).

[Les exceptions](http://www.apprendre-php.com/tutoriels/tutoriel-42-les-exceptions-2me-partie.html).

[Openclassrooms](https://openclassrooms.com/courses/programmez-en-oriente-objet-en-php/les-exceptions-10).

<blockquote>Anouar Kahla</blockquote>
