package com.webaudit.journeyErrors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import com.webaudit.messaging.web.PubSubAuditController;
import com.webaudit.models.enums.JourneyStatus;
import com.webaudit.models.journeys.Journey;
import com.webaudit.models.message.JourneyCandidateMessage;
import com.webaudit.services.JourneyService;

/*
 * Copyright 2019 WebAudit Inc
 *

 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
@RestController
public class AuditController extends PubSubAuditController<JourneyCandidateMessage> {

	private static final Logger log = LoggerFactory.getLogger(AuditController.class);

	@Autowired
	private JourneyService journey_service;

	@Override
	protected String serviceName() {
		return "journey-errors";
	}

	@Override
	protected String topicName() {
		return "journey_candidate_dlq";
	}

	@Override
	protected Class<JourneyCandidateMessage> payloadType() {
		return JourneyCandidateMessage.class;
	}

	@Override
	protected void handle(JourneyCandidateMessage journey_msg) {
		Journey journey = journey_msg.getJourney();
		if (!JourneyStatus.CANDIDATE.equals(journey.getStatus())) {
			log.warn("Journey {} already non-CANDIDATE (status={}); skipping",
				journey.getId(), journey.getStatus());
			return;
		}
		journey_service.updateStatus(journey.getId(), JourneyStatus.ERROR);
	}
}
